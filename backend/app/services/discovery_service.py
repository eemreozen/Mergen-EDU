from app.ai.prompts.discovery import SYSTEM
from app.errors import AppError
from app.schemas.discovery import DiscoveryAnswer, DiscoveryQuestion, DiscoveryView, FollowupPlan
from app.services.project_service import owned_project


def question_section(question, questions):
    if question.get("section"):
        return question["section"]
    if question["target_field"].startswith("projectDetail") or question["id"].startswith("project-detail-"):
        return "project"
    parent = next((q for q in questions if q["id"] == question.get("parent_question_id")), None)
    if parent and (parent.get("section") == "project" or parent["target_field"].startswith("projectDetail")):
        return "project"
    return "advisor"


def discovery_view(project):
    data = project.discovery_data
    answers = {a["question_id"]: a for a in data["answers"]}
    questions = [
        DiscoveryQuestion(
            **{**q, "section": question_section(q, data["questions"]), "completed": q["id"] in answers}
        )
        for q in data["questions"]
    ]
    questions.sort(key=lambda q: q.section == "project")
    pending = [q for q in questions if q.required and not q.completed]
    ready = not pending and data.get("followupsGenerated", False)
    return DiscoveryView(
        questions=questions,
        answers=[DiscoveryAnswer(**a) for a in data["answers"]],
        completed=ready,
        next_question=pending[0] if pending else None,
        ready_for_roadmap=ready,
    )


def answer_fields(project):
    values = {a["question_id"]: a["value"] for a in project.discovery_data["answers"]}
    return {
        q["target_field"]: values[q["id"]] for q in project.discovery_data["questions"] if q["id"] in values
    }


async def save_answers(db, project_id, user_id, request, gateway):
    project = await owned_project(db, project_id, user_id, lock=True)
    if project.status not in {"discovery", "ready_for_roadmap"}:
        raise AppError("DISCOVERY_CLOSED", "Aktif haritanın keşif cevapları değiştirilemez.", 409)
    from app.services.project_service import ensure_ai_source

    ensure_ai_source(project, gateway)
    data = dict(project.discovery_data)
    questions = {q["id"]: q for q in data["questions"]}
    answers = {a["question_id"]: a for a in data["answers"]}
    if len({a.question_id for a in request.answers}) != len(request.answers):
        raise AppError("INVALID_ANSWER", "Aynı soruya birden fazla cevap verilemez.", 422)
    for answer in request.answers:
        question = questions.get(answer.question_id)
        value = answer.value
        if not question:
            raise AppError("INVALID_QUESTION", "Soru bu projeye ait değil.", 422)
        if question["type"] == "multi_choice":
            valid = isinstance(value, list) and bool(value) and len(value) == len(set(value))
            valid = valid and all(v in question["options"] for v in value)
        else:
            valid = isinstance(value, str) and bool(value.strip()) and len(value) <= 2000
            if question["type"] == "single_choice":
                valid = valid and value in question["options"]
        if not valid:
            raise AppError("INVALID_ANSWER", "Cevap soru tipi veya seçenekleriyle uyumsuz.", 422)
        if question["target_field"] == "weeklyHours":
            try:
                hours = float(value)
                if not 0 < hours <= 168:
                    raise ValueError
            except (ValueError, TypeError):
                raise AppError(
                    "INVALID_HOURS", "Haftalık süre 0 ile 168 arasında sayı olmalı.", 422
                ) from None
        answers[answer.question_id] = answer.model_dump()
    data["answers"] = list(answers.values())
    project.discovery_data = data
    if (
        all(
            not q["required"] or q["id"] in answers
            for q in data["questions"]
            if question_section(q, data["questions"]) == "advisor"
        )
        and not data["followupsGenerated"]
    ):
        fields = answer_fields(project)
        if fields.get("aiStrategy") == "train_model":
            followup = DiscoveryQuestion(
                section="advisor",
                id="followup-python",
                question_id="followup-python",
                text="Do you have Python and dataset preparation experience?"
                if project.locale == "en"
                else "Python ve veri seti hazırlama deneyimin var mı?",
                type="short_text",
                target_field="pythonExperience",
                parent_question_id="ai_strategy",
            )
            data["questions"] = [*data["questions"], followup.model_dump()]
        elif any(v == "undecided" for v in fields.values()):
            plan = await gateway.generate_structured(
                "discovery",
                SYSTEM,
                {"project": project.analysis, "answers": fields, "questions": data["questions"]},
                FollowupPlan,
            )
            for index, item in enumerate(plan.questions):
                if item.parent_question_id not in questions or item.target_field in fields:
                    raise AppError("AI_INVALID_OUTPUT", "Takip sorusu referansı geçersiz.", 502, True)
                identifier = f"followup-{index}"
                q = DiscoveryQuestion(
                    id=identifier,
                    question_id=identifier,
                    section=question_section(questions[item.parent_question_id], data["questions"]),
                    text=item.text,
                    type="short_text",
                    target_field=item.target_field,
                    parent_question_id=item.parent_question_id,
                )
                data["questions"] = [*data["questions"], q.model_dump()]
        data["followupsGenerated"] = True
    project.discovery_data = dict(data)
    view = discovery_view(project)
    project.status = "ready_for_roadmap" if view.ready_for_roadmap else "discovery"
    from app.services.skill_service import save_self_reported

    await save_self_reported(db, user_id, answer_fields(project))
    await db.flush()
    return view
