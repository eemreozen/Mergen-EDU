from types import SimpleNamespace

from app.services.discovery_service import discovery_view
from app.templates.registry import select_questions


def test_fixed_questions_are_project_building_decisions():
    questions = select_questions("core", [], "tr")
    assert {q.target_field for q in questions if q.required} == {"experienceLevel", "weeklyHours"}
    assert next(q for q in questions if q.target_field == "knownTechnologies").required is False
    assert next(q for q in questions if q.target_field == "weeklyHours").type == "single_choice"
    assert all(q.section == "advisor" for q in questions)
    assert len(select_questions("mobile", ["ai_ml"], "en")) == 3


def test_legacy_questions_get_sections_without_changing_answers():
    questions = [q.model_dump() for q in select_questions("core", [], "tr")]
    questions.append(
        {
            **questions[0],
            "id": "project-detail-0",
            "question_id": "project-detail-0",
            "target_field": "projectDetailUsers",
        }
    )
    for question in questions:
        question.pop("section", None)
    project = SimpleNamespace(
        discovery_data={"questions": questions, "answers": [], "followupsGenerated": False}
    )
    view = discovery_view(project)
    assert view.questions[-1].section == "project"
    assert view.next_question.section == "advisor"
    assert project.discovery_data["answers"] == []


async def test_advisor_then_project_questions_block_early_roadmap(client, app, project_id, monkeypatch):
    calls = []

    async def no_followup(operation, system, payload, schema):
        assert operation == "discovery"
        calls.append(payload)
        return schema(questions=[])

    monkeypatch.setattr(app.state.gateway, "generate_structured", no_followup)
    discovery = (await client.get(f"/api/v1/projects/{project_id}/discovery")).json()
    advisor = [q for q in discovery["questions"] if q["section"] == "advisor"]
    project = [q for q in discovery["questions"] if q["section"] == "project"]
    assert len(project) == 2
    values = {"weeklyHours": "6"}
    response = await client.post(
        f"/api/v1/projects/{project_id}/discovery/answers",
        json={
            "answers": [
                {
                    "questionId": q["id"],
                    "value": values.get(q["targetField"], q["options"][0] if q["options"] else "Esnek"),
                }
                for q in advisor
            ]
        },
    )
    assert response.status_code == 200, response.text
    second = response.json()
    assert calls == []
    assert second["nextQuestion"]["section"] == "project"
    assert not second["readyForRoadmap"]
    assert (await client.post(f"/api/v1/projects/{project_id}/roadmap/generate")).status_code == 409
    final = await client.post(
        f"/api/v1/projects/{project_id}/discovery/answers",
        json={"answers": [{"questionId": q["id"], "value": "recommend"} for q in project]},
    )
    assert final.status_code == 200, final.text
    assert final.json()["readyForRoadmap"]
    assert len(calls) == 1


async def test_clear_idea_needs_only_two_profile_answers(client, app, monkeypatch):
    from app.models.project import Project
    from app.services.discovery_service import answer_fields

    original = app.state.gateway.generate_structured

    async def clear_idea(operation, system, payload, schema):
        result = await original(operation, system, payload, schema)
        result.discovery_questions = []
        result.uncertain_decisions = []
        return result

    monkeypatch.setattr(app.state.gateway, "generate_structured", clear_idea)
    created = await client.post(
        "/api/v1/projects", json={"idea": "Kişisel tarif defteri projesi geliştirmek istiyorum."}
    )
    assert created.status_code == 201, created.text
    identifier = created.json()["id"]
    discovery = await client.post(
        f"/api/v1/projects/{identifier}/discovery/answers",
        json={
            "answers": [
                {"questionId": "experience", "value": "beginner"},
                {"questionId": "hours", "value": "5"},
            ]
        },
    )
    assert discovery.status_code == 200 and discovery.json()["readyForRoadmap"]
    assert len(discovery.json()["answers"]) == 2
    async with app.state.session_factory() as db:
        project = await db.get(Project, identifier)
        assert answer_fields(project)["goal"] == "mvp"
        assert project.discovery_data["planningDefaults"] == {
            "goal": "mvp",
            "deliveryConstraints": "flexible",
        }
        assert {a["question_id"] for a in project.discovery_data["answers"]} == {"experience", "hours"}


async def test_invalid_questions_cannot_silently_skip_discovery(client, app, monkeypatch):
    original = app.state.gateway.generate_structured

    async def poor_questions(operation, system, payload, schema):
        result = await original(operation, system, payload, schema)
        result.discovery_questions[0].text = "Bu projeyi hangi teknolojilerle geliştirmek istiyorsun?"
        result.discovery_questions[1].text = "Çok uzun bir soru " * 12
        return result

    monkeypatch.setattr(app.state.gateway, "generate_structured", poor_questions)
    created = await client.post(
        "/api/v1/projects", json={"idea": "Bir yemek tarifi uygulaması geliştirmek istiyorum."}
    )
    assert created.status_code == 502, created.text
    assert created.json()["error"]["code"] == "AI_INVALID_OUTPUT"


def test_unknown_technology_is_not_recorded_as_a_skill():
    from app.services.skill_service import known_technologies

    assert known_technologies({"knownTechnologies": "Henüz bilmiyorum."}) == []
    assert known_technologies({"knownTechnologies": "Python, React, none"}) == ["Python", "React"]
