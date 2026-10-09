from types import SimpleNamespace

from app.services.discovery_service import discovery_view
from app.templates.registry import select_questions


def test_fixed_questions_are_project_building_decisions():
    questions = select_questions("core", [], "tr")
    assert {q.target_field for q in questions} == {
        "goal",
        "platform",
        "experienceLevel",
        "knownTechnologies",
        "preferredStack",
        "weeklyHours",
        "deliveryConstraints",
    }
    goal = next(q for q in questions if q.target_field == "goal")
    assert goal.options == ["prototype", "mvp", "production_ready"]
    assert all(q.section == "advisor" for q in questions)
    assert len(select_questions("core", [], "en")) == 7


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


async def test_advisor_then_project_questions_block_early_roadmap(client, project_id):
    discovery = (await client.get(f"/api/v1/projects/{project_id}/discovery")).json()
    advisor = [q for q in discovery["questions"] if q["section"] == "advisor"]
    project = [q for q in discovery["questions"] if q["section"] == "project"]
    assert len(project) == 4
    values = {"goal": "mvp", "weeklyHours": "8", "aiStrategy": "api"}
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
    assert second["nextQuestion"]["section"] == "project"
    assert not second["readyForRoadmap"]
    assert (await client.post(f"/api/v1/projects/{project_id}/roadmap/generate")).status_code == 409
    final = await client.post(
        f"/api/v1/projects/{project_id}/discovery/answers",
        json={
            "answers": [
                {"questionId": q["id"], "value": "Projeyi küçük bir kullanıcı grubuyla doğrulayacağım."}
                for q in project
            ]
        },
    )
    assert final.status_code == 200, final.text
    assert final.json()["readyForRoadmap"]


def test_unknown_technology_is_not_recorded_as_a_skill():
    from app.services.skill_service import known_technologies

    assert known_technologies({"knownTechnologies": "Henüz bilmiyorum."}) == []
    assert known_technologies({"knownTechnologies": "Python, React, none"}) == ["Python", "React"]
