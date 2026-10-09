from datetime import UTC, timedelta

from sqlalchemy import select

from app.ai.prompts.memory import SYSTEM
from app.db.base import utcnow
from app.errors import AppError, not_found
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.memory import MemoryCheck, MemoryReview
from app.models.roadmap import RoadmapMap, RoadmapNode
from app.schemas.memory import (
    MemoryChallenge,
    MemoryDraft,
    MemoryResult,
    MemoryReviewView,
    TimeMachineView,
    WrongQuestionView,
)
from app.services.project_service import ensure_ai_source, owned_project


def aware(date):
    return date.replace(tzinfo=UTC) if date.tzinfo is None else date


async def progress(db, project_id):
    return len(
        list(
            await db.scalars(
                select(RoadmapNode.id)
                .join(RoadmapMap, RoadmapNode.map_id == RoadmapMap.id)
                .where(
                    RoadmapMap.project_id == project_id,
                    RoadmapMap.kind == "root",
                    RoadmapNode.status == "completed",
                    RoadmapNode.type != "milestone",
                )
            )
        )
    )


async def sync_reviews(db, project_id):
    """Backfill old learned skills too; reading history never calls an AI model."""
    count = await progress(db, project_id)
    learned = (
        await db.execute(
            select(RoadmapNode, Assessment)
            .join(RoadmapMap, RoadmapNode.map_id == RoadmapMap.id)
            .join(Assessment, Assessment.node_id == RoadmapNode.id)
            .where(
                RoadmapMap.project_id == project_id,
                RoadmapMap.kind != "adaptive",
                RoadmapNode.status == "completed",
            )
        )
    ).all()
    existing = {
        (r.source_node_id, r.skill)
        for r in await db.scalars(select(MemoryReview).where(MemoryReview.project_id == project_id))
    }
    for node, assessment in learned:
        for skill in {q["target_skill"] for q in assessment.questions}:
            if (node.id, skill) in existing:
                continue
            db.add(
                MemoryReview(
                    project_id=project_id,
                    source_node_id=node.id,
                    skill=skill,
                    due_progress=count + 3,
                    due_at=utcnow() + timedelta(days=1),
                )
            )
    await db.flush()
    return count


async def recall_old_gaps(db, project_id, current_node_id, weak_skills):
    """A weak previously learned skill gets a short review, not a roadmap reset."""
    await sync_reviews(db, project_id)
    rows = list(
        await db.scalars(
            select(MemoryReview).where(
                MemoryReview.project_id == project_id,
                MemoryReview.source_node_id != current_node_id,
                MemoryReview.skill.in_(weak_skills),
            )
        )
    )
    # One review per skill is enough even when multiple earlier nodes taught it.
    selected = {}
    for review in rows:
        selected.setdefault(review.skill, review)
    count = await progress(db, project_id)
    for review in selected.values():
        review.status = "refresher"
        review.due_progress = count
        review.due_at = utcnow()
    await db.flush()
    return list(selected.values())


async def time_machine(db, project_id, user_id):
    await owned_project(db, project_id, user_id, lock=True)
    count = await sync_reviews(db, project_id)
    reviews = list(
        await db.scalars(
            select(MemoryReview)
            .where(MemoryReview.project_id == project_id)
            .order_by(MemoryReview.due_progress, MemoryReview.created_at, MemoryReview.id)
        )
    )
    nodes = {
        n.id: n
        for n in await db.scalars(
            select(RoadmapNode)
            .join(RoadmapMap, RoadmapNode.map_id == RoadmapMap.id)
            .where(RoadmapMap.project_id == project_id)
        )
    }
    views = [
        MemoryReviewView(
            id=r.id,
            source_node_id=r.source_node_id,
            source_title=nodes[r.source_node_id].title,
            skill=r.skill,
            level=r.level,
            status=r.status,
            due=count >= r.due_progress or utcnow() >= aware(r.due_at),
            due_at=r.due_at,
            remaining_steps=max(0, r.due_progress - count),
        )
        for r in reviews
    ]
    by_skill = {(r.source_node_id, r.skill): r.id for r in reviews}
    attempts = (
        await db.execute(
            select(AssessmentAttempt, Assessment)
            .join(Assessment, Assessment.id == AssessmentAttempt.assessment_id)
            .join(RoadmapNode, RoadmapNode.id == Assessment.node_id)
            .join(RoadmapMap, RoadmapMap.id == RoadmapNode.map_id)
            .where(RoadmapMap.project_id == project_id, AssessmentAttempt.user_id == user_id)
            .order_by(AssessmentAttempt.created_at.desc(), AssessmentAttempt.id.desc())
        )
    ).all()
    wrong = {}
    for attempt, assessment in attempts:
        answers = {a["question_id"]: a["selected_index"] for a in attempt.answers}
        for question in assessment.questions:
            index = answers.get(question["id"])
            if index is None or index == question["correct_index"]:
                continue
            if question["id"] in wrong:
                wrong[question["id"]].wrong_count += 1
                continue
            wrong[question["id"]] = WrongQuestionView(
                question_id=question["id"],
                node_id=assessment.node_id,
                node_title=nodes[assessment.node_id].title,
                prompt=question["prompt"],
                selected_option=question["options"][index],
                correct_option=question["options"][question["correct_index"]],
                explanation=question["explanation"],
                skill=question["target_skill"],
                wrong_count=1,
                last_wrong_at=attempt.created_at,
                review_id=by_skill.get((assessment.node_id, question["target_skill"])),
            )
    # Retrieval-practice mistakes are history too, including their new wording.
    checks = (
        await db.execute(
            select(MemoryCheck, MemoryReview)
            .join(MemoryReview, MemoryReview.id == MemoryCheck.review_id)
            .where(MemoryReview.project_id == project_id, MemoryCheck.selected_index.is_not(None))
        )
    ).all()
    for check, review in checks:
        if not check.result or check.result["correct"]:
            continue
        question = check.draft["question"]
        wrong[check.id] = WrongQuestionView(
            question_id=check.id,
            node_id=review.source_node_id,
            node_title=nodes[review.source_node_id].title,
            prompt=question["prompt"],
            selected_option=question["options"][check.selected_index],
            correct_option=question["options"][question["correct_index"]],
            explanation=question["explanation"],
            skill=review.skill,
            wrong_count=1,
            last_wrong_at=check.created_at,
            review_id=review.id,
        )
    return TimeMachineView(
        completed_steps=count,
        due_count=sum(r.due for r in views),
        reviews=views,
        wrong_questions=sorted(wrong.values(), key=lambda q: aware(q.last_wrong_at), reverse=True),
    )


async def owned_review(db, review_id, user_id):
    review = await db.get(MemoryReview, review_id)
    if not review:
        raise not_found()
    project = await owned_project(db, review.project_id, user_id, lock=True)
    return review, project


async def prepare_review(db, review_id, user_id, gateway):
    review, project = await owned_review(db, review_id, user_id)
    node = await db.get(RoadmapNode, review.source_node_id)
    existing = await db.scalar(
        select(MemoryCheck)
        .where(MemoryCheck.review_id == review.id, MemoryCheck.selected_index.is_(None))
        .order_by(MemoryCheck.created_at.desc())
    )
    if not existing:
        ensure_ai_source(project, gateway)
        assessment = await db.scalar(select(Assessment).where(Assessment.node_id == node.id))
        original = [q["prompt"] for q in assessment.questions if q["target_skill"] == review.skill]
        previous = await db.scalar(
            select(MemoryCheck)
            .where(MemoryCheck.review_id == review.id)
            .order_by(MemoryCheck.created_at.desc(), MemoryCheck.id.desc())
        )
        draft = await gateway.generate_structured(
            "memory_review",
            SYSTEM,
            {
                "project": {"title": project.title, "goal": project.analysis["goal"]},
                "locale": project.locale,
                "skill": review.skill,
                "sourceTitle": node.title,
                "originalQuestions": original,
                "previousQuestion": previous.draft["question"]["prompt"] if previous else None,
            },
            MemoryDraft,
        )
        old_prompts = original + ([previous.draft["question"]["prompt"]] if previous else [])
        def normalize(text):
            return " ".join(text.casefold().split())
        if draft.question.target_skill != review.skill or normalize(draft.question.prompt) in {
            normalize(p) for p in old_prompts
        }:
            raise AppError("AI_INVALID_OUTPUT", "Tekrar sorusu farklı bir örnekle aynı beceriyi ölçmeli.", 502, True)
        existing = MemoryCheck(review_id=review.id, draft=draft.model_dump())
        db.add(existing)
        await db.flush()
    question = existing.draft["question"]
    return MemoryChallenge(
        id=existing.id,
        review_id=review.id,
        source_title=node.title,
        skill=review.skill,
        prompt=question["prompt"],
        options=question["options"],
    )


async def submit_review(db, review_id, user_id, body):
    review, _ = await owned_review(db, review_id, user_id)
    check = await db.get(MemoryCheck, body.check_id)
    if not check or check.review_id != review.id:
        raise not_found()
    if check.result is not None:
        if check.submission_id != str(body.submission_id) or check.selected_index != body.selected_index:
            raise AppError("SUBMISSION_CONFLICT", "Bu tekrar sorusu daha önce cevaplandı.", 409)
        return MemoryResult.model_validate(check.result)
    question = check.draft["question"]
    if body.selected_index >= len(question["options"]):
        raise AppError("INVALID_SUBMISSION", "Cevap indeksi seçenek aralığı dışında.", 422)
    correct = body.selected_index == question["correct_index"]
    count = await progress(db, review.project_id)
    if correct:
        review.level = min(review.level + 1, 4)
        review.status = "scheduled"
        gap = (3, 6, 12, 24)[review.level - 1]
        review.due_progress = count + gap
        review.due_at = utcnow() + timedelta(days=(1, 3, 7, 14)[review.level - 1])
    else:
        review.level = 0
        review.status = "refresher"
        review.due_progress = count
        review.due_at = utcnow()
    result = MemoryResult(
        check_id=check.id,
        correct=correct,
        correct_index=question["correct_index"],
        explanation=question["explanation"],
        refresher=check.draft["refresher"] if not correct else "",
        mini_exercise=check.draft["mini_exercise"] if not correct else "",
        next_due_at=review.due_at,
        remaining_steps=max(0, review.due_progress - count),
    )
    check.submission_id = str(body.submission_id)
    check.selected_index = body.selected_index
    check.result = result.model_dump(mode="json")
    await db.flush()
    return result
