from sqlalchemy import select

from app.ai.prompts.assessment import SYSTEM
from app.db.base import new_id
from app.errors import AppError
from app.graph.progression import recalculate, require_access
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.roadmap import RoadmapNode
from app.schemas.assessment import AssessmentDraft, AssessmentResult, AssessmentView, DemoAssessmentView
from app.services.remediation_service import active_branch, add_remediation
from app.services.roadmap_service import map_view, owned_map, owned_node
from app.services.skill_service import update_assessed


def assessment_view(assessment, demo=False):
    questions = (
        assessment.questions
        if demo
        else [
            {k: v for k, v in q.items() if k not in {"correct_index", "explanation"}}
            for q in assessment.questions
        ]
    )
    model = DemoAssessmentView if demo else AssessmentView
    return model(
        id=assessment.id,
        node_id=assessment.node_id,
        title=assessment.title,
        passing_score=assessment.passing_score,
        version=assessment.version,
        questions=questions,
    )


async def get_assessment(db, node_id, user_id, gateway):
    node = await owned_node(db, node_id, user_id, lock=True)
    await require_access(db, node)
    if node.type not in {"learning", "remedial", "submap", "development_task"}:
        raise AppError("ASSESSMENT_NOT_APPLICABLE", "Bu düğüm testle tamamlanmaz.", 409)
    assessment = await db.scalar(select(Assessment).where(Assessment.node_id == node.id))
    if not assessment:
        from app.services.project_service import ensure_ai_source, owned_project

        roadmap = await owned_map(db, node.map_id, user_id)
        ensure_ai_source(await owned_project(db, roadmap.project_id, user_id), gateway)
        from app.ai.context_builder import build_context

        draft = await gateway.generate_structured(
            "assessment", SYSTEM, await build_context(db, user_id, node=node), AssessmentDraft
        )
        if any(q.target_skill not in node.skills for q in draft.questions):
            raise AppError("AI_INVALID_OUTPUT", "Sorular düğüm dışındaki becerileri hedefliyor.", 502, True)
        if not set(node.skills) <= {q.target_skill for q in draft.questions}:
            raise AppError("AI_INVALID_OUTPUT", "Test düğümün tüm becerilerini kapsamıyor.", 502, True)
        # LLM soru kimlikleri yalnızca taslakta geçerlidir; kalıcı kimlikler backend tarafından verilir.
        questions = [{**q.model_dump(), "id": new_id()} for q in draft.questions]
        assessment = Assessment(node_id=node.id, title=draft.title, questions=questions, passing_score=100)
        db.add(assessment)
        await db.flush()
    return assessment_view(assessment)


def evaluate(questions, answers, passing_score):
    by_id = {a.question_id: a.selected_index for a in answers}
    if len(by_id) != len(answers) or set(by_id) != {q["id"] for q in questions}:
        raise AppError("INVALID_SUBMISSION", "Her soru tam bir kez cevaplanmalı.", 422)
    correct = 0
    weak = set()
    for question in questions:
        selected = by_id[question["id"]]
        if not 0 <= selected < len(question["options"]):
            raise AppError("INVALID_SUBMISSION", "Cevap indeksi seçenek aralığı dışında.", 422)
        if selected == question["correct_index"]:
            correct += 1
        else:
            weak.add(question["target_skill"])
    score = round(correct / len(questions) * 100, 2)
    return score, score >= passing_score, sorted(weak)


async def submit_assessment(db, node_id, user_id, body, gateway):
    node = await owned_node(db, node_id, user_id, lock=True)
    assessment = await db.scalar(
        select(Assessment).where(Assessment.id == body.assessment_id, Assessment.node_id == node.id)
    )
    if not assessment:
        raise AppError("ASSESSMENT_NOT_FOUND", "Değerlendirme bu düğüme ait değil.", 404)
    previous = await db.scalar(
        select(AssessmentAttempt).where(
            AssessmentAttempt.assessment_id == assessment.id,
            AssessmentAttempt.user_id == user_id,
            AssessmentAttempt.submission_id == str(body.submission_id),
        )
    )
    if previous:
        if previous.answers != [a.model_dump() for a in body.answers] or body.version != assessment.version:
            raise AppError(
                "SUBMISSION_CONFLICT", "Aynı gönderim kimliği farklı cevaplarla kullanılamaz.", 409
            )
        return AssessmentResult.model_validate(previous.result)
    await require_access(db, node)
    if body.version != assessment.version:
        raise AppError("ASSESSMENT_VERSION_MISMATCH", "Değerlendirme sürümü güncel değil.", 409)
    if node.status == "completed":
        raise AppError("ASSESSMENT_ALREADY_PASSED", "Bu düğümün değerlendirmesi zaten geçildi.", 409)
    active_remedies = list(
        await db.scalars(
            select(RoadmapNode).where(
                RoadmapNode.remediation_for_node_id == node.id, RoadmapNode.status != "completed"
            )
        )
    )
    if active_remedies or await active_branch(db, node):
        raise AppError(
            "REMEDIATION_REQUIRED", "Ana testi tekrar denemeden önce telafi düğümlerini tamamlayın.", 409
        )
    score, passed, weak = evaluate(assessment.questions, body.answers, assessment.passing_score)
    passed = passed and not weak
    node.status = (
        ("in_progress" if node.type == "development_task" else "completed") if passed else "needs_review"
    )
    branch, created = None, False
    memory_reviews = []
    if not passed:
        from app.services.memory_service import recall_old_gaps

        current_map = await owned_map(db, node.map_id, user_id)
        if current_map.kind != "adaptive":
            memory_reviews = await recall_old_gaps(db, current_map.project_id, node.id, weak)
        selected = {a.question_id: a.selected_index for a in body.answers}
        failed_questions = [
            {
                "prompt": q["prompt"],
                "targetSkill": q["target_skill"],
                "selectedOption": q["options"][selected[q["id"]]],
            }
            for q in assessment.questions
            if selected[q["id"]] != q["correct_index"]
        ]
        old_skills = {review.skill for review in memory_reviews}
        new_weak = [skill for skill in weak if skill not in old_skills]
        if new_weak:
            branch, created = await add_remediation(
                db,
                node,
                new_weak,
                gateway,
                failed_questions=[q for q in failed_questions if q["targetSkill"] in new_weak],
            )
    await update_assessed(db, user_id, [q["target_skill"] for q in assessment.questions], weak, score)
    await recalculate(db, node.map_id)
    current_map = await owned_map(db, node.map_id, user_id)
    from app.services.memory_service import sync_reviews

    await sync_reviews(db, current_map.project_id)
    roadmap = await map_view(db, current_map)
    attempt_id = new_id()
    result = AssessmentResult(
        attempt_id=attempt_id,
        passed=passed,
        score=score,
        weak_skills=weak,
        remediation_created=created,
        adaptive_map=await map_view(db, branch) if branch else None,
        memory_review_ids=[r.id for r in memory_reviews],
        map=roadmap,
    )
    db.add(
        AssessmentAttempt(
            id=attempt_id,
            assessment_id=assessment.id,
            user_id=user_id,
            submission_id=str(body.submission_id),
            answers=[a.model_dump() for a in body.answers],
            score=score,
            passed=passed,
            weak_skills=weak,
            result=result.model_dump(mode="json"),
        )
    )
    await db.flush()
    return result
