from uuid import uuid4

import pytest
from conftest import finish_discovery

from app.errors import AppError
from app.schemas.assessment import AnswerSubmission
from app.services.assessment_service import evaluate


async def prepare_ml(client, project_id):
    await finish_discovery(client, project_id)
    root = (await client.post(f"/api/v1/projects/{project_id}/roadmap/generate")).json()
    ml = next(n for n in root["nodes"] if n["type"] == "submap" and "Machine" in n["title"])
    child = (await client.post(f"/api/v1/nodes/{ml['id']}/submap")).json()
    python = next(n for n in child["nodes"] if n["title"] == "Python")
    return root, child, python


async def answer_test(client, project_id, node_id, wrong_skill=None, submission_id=None):
    quiz_response = await client.get(f"/api/v1/nodes/{node_id}/assessment")
    assert quiz_response.status_code == 200, quiz_response.text
    quiz = quiz_response.json()
    export = (await client.get(f"/api/v1/projects/{project_id}/export?mode=demo")).json()
    internal = next(a for a in export["assessments"] if a["id"] == quiz["id"])
    answers = [
        {
            "questionId": q["id"],
            "selectedIndex": (q["correctIndex"] + 1) % len(q["options"])
            if q["targetSkill"] == wrong_skill
            else q["correctIndex"],
        }
        for q in internal["questions"]
    ]
    body = {
        "assessmentId": quiz["id"],
        "version": quiz["version"],
        "submissionId": submission_id or str(uuid4()),
        "answers": answers,
    }
    response = await client.post(f"/api/v1/nodes/{node_id}/assessment/submit", json=body)
    return response, body


async def test_assessment_privacy_and_cache(client, project_id):
    _, child, python = await prepare_ml(client, project_id)
    node_id = python["id"]
    detail = (await client.get(f"/api/v1/nodes/{node_id}")).json()
    assert detail["whyNeeded"] and detail["practicalTask"]["expectedOutput"]
    first = (await client.get(f"/api/v1/nodes/{node_id}/assessment")).json()
    second = (await client.get(f"/api/v1/nodes/{node_id}/assessment")).json()
    assert first == second
    assert all("correctIndex" not in q and not q["explanation"] for q in first["questions"])
    public = (await client.get(f"/api/v1/projects/{project_id}/export")).json()
    assert "correctIndex" not in str(public)
    locked = next(n for n in child["nodes"] if n["status"] == "locked")
    assert (await client.get(f"/api/v1/nodes/{locked['id']}")).status_code == 409
    assert (await client.get(f"/api/v1/nodes/{locked['id']}/assessment")).status_code == 409
    assert (await client.get(f"/api/v1/nodes/{node_id}/resources")).json()


async def test_correct_score_and_duplicate_submission(client, project_id):
    _, child, python = await prepare_ml(client, project_id)
    response, body = await answer_test(client, project_id, python["id"])
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["passed"] and result["score"] == 100 and result["weakSkills"] == []
    retry = await client.post(f"/api/v1/nodes/{python['id']}/assessment/submit", json=body)
    assert retry.json() == result
    body["submissionId"] = str(uuid4())
    assert (
        await client.post(f"/api/v1/nodes/{python['id']}/assessment/submit", json=body)
    ).status_code == 409
    current = (await client.get(f"/api/v1/maps/{child['id']}")).json()
    assert next(n for n in current["nodes"] if n["title"] == "Fonksiyonlar")["status"] == "available"


@pytest.mark.parametrize(
    "answers",
    [
        [AnswerSubmission(question_id="q", selected_index=3)],
        [
            AnswerSubmission(question_id="q", selected_index=0),
            AnswerSubmission(question_id="q", selected_index=0),
        ],
        [AnswerSubmission(question_id="other", selected_index=0)],
    ],
)
def test_invalid_answers(answers):
    with pytest.raises(AppError):
        evaluate(
            [{"id": "q", "options": ["a", "b"], "correct_index": 0, "target_skill": "python.functions"}],
            answers,
            70,
        )
