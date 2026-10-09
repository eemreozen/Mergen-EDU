from datetime import timedelta
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from conftest import finish_discovery
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from test_assessment import answer_test, prepare_ml
from test_remediation import complete_branch

from app.db.base import utcnow
from app.models.memory import MemoryReview
from app.models.roadmap import RoadmapMap


async def machine(client, project_id):
    response = await client.get(f"/api/v1/projects/{project_id}/time-machine")
    assert response.status_code == 200, response.text
    return response.json()


async def learned_root(client, project_id):
    await finish_discovery(client, project_id)
    root = (await client.post(f"/api/v1/projects/{project_id}/roadmap/generate")).json()
    basics = next(n for n in root["nodes"] if n["title"] == "Programlama Temelleri")
    passed, _ = await answer_test(client, project_id, basics["id"])
    assert passed.json()["passed"]
    return root, basics


async def test_history_backfills_wrong_questions_without_ai(client, app, project_id):
    _, _, python = await prepare_ml(client, project_id)
    failed, _ = await answer_test(client, project_id, python["id"], "python.functions")
    await complete_branch(client, project_id, failed.json()["adaptiveMap"])
    again, _ = await answer_test(client, project_id, python["id"], "python.functions")
    assert again.status_code == 200
    app.state.gateway.generate_structured = AsyncMock(side_effect=AssertionError("History must not call AI"))
    data = await machine(client, project_id)
    assert data["wrongQuestions"]
    item = data["wrongQuestions"][0]
    assert item["nodeId"] == python["id"] and item["wrongCount"] == 2
    assert item["selectedOption"] != item["correctOption"]
    assert item["explanation"]
    assert item["reviewId"] is None  # Unfinished source cannot be skipped via recall.
    app.state.gateway.generate_structured.assert_not_called()


async def test_spaced_review_due_after_three_new_steps_or_time(client, app, project_id):
    await learned_root(client, project_id)
    data = await machine(client, project_id)
    first = data["reviews"][0]
    assert first["remainingSteps"] == 3 and not first["due"]
    # Complete real available root nodes; adaptive-node completions do not count.
    for _ in range(3):
        current = (await client.get(f"/api/v1/projects/{project_id}/roadmap")).json()
        node = next(n for n in current["nodes"] if n["status"] == "available" and n["type"] == "learning")
        passed, _ = await answer_test(client, project_id, node["id"])
        assert passed.json()["passed"]
    due = next(r for r in (await machine(client, project_id))["reviews"] if r["id"] == first["id"])
    assert due["due"] and due["remainingSteps"] == 0
    async with app.state.session_factory() as db:
        review = await db.get(MemoryReview, first["id"])
        review.due_progress = 999
        review.due_at = utcnow() - timedelta(seconds=1)
        await db.commit()
    assert next(r for r in (await machine(client, project_id))["reviews"] if r["id"] == first["id"])["due"]


async def test_review_cache_failure_retry_success_and_no_rollback(client, app, project_id):
    await learned_root(client, project_id)
    before = (await client.get(f"/api/v1/projects/{project_id}/roadmap")).json()
    review = (await machine(client, project_id))["reviews"][0]
    spy = AsyncMock(wraps=app.state.gateway.generate_structured)
    app.state.gateway.generate_structured = spy
    response = await client.post(f"/api/v1/memory/{review['id']}/prepare")
    assert response.status_code == 200, response.text
    quiz = response.json()
    assert "correctIndex" not in quiz and "explanation" not in quiz
    again = await client.post(f"/api/v1/memory/{review['id']}/prepare")
    assert again.json() == quiz
    assert spy.await_count == 1
    body = {"checkId": quiz["id"], "submissionId": str(uuid4()), "selectedIndex": 1}
    wrong = await client.post(f"/api/v1/memory/{review['id']}/answer", json=body)
    assert wrong.status_code == 200, wrong.text
    assert not wrong.json()["correct"] and wrong.json()["refresher"] and wrong.json()["miniExercise"]
    history = (await machine(client, project_id))["wrongQuestions"]
    assert any(item["prompt"] == quiz["prompt"] and item["reviewId"] == review["id"] for item in history)
    assert (await client.post(f"/api/v1/memory/{review['id']}/answer", json=body)).json() == wrong.json()
    altered = {**body, "selectedIndex": 0}
    assert (await client.post(f"/api/v1/memory/{review['id']}/answer", json=altered)).status_code == 409
    assert (await client.get(f"/api/v1/projects/{project_id}/roadmap")).json() == before
    refreshed = await client.post(f"/api/v1/memory/{review['id']}/prepare")
    assert refreshed.status_code == 200, refreshed.text
    next_quiz = refreshed.json()
    assert next_quiz["prompt"] != quiz["prompt"]
    correct = await client.post(
        f"/api/v1/memory/{review['id']}/answer",
        json={"checkId": next_quiz["id"], "submissionId": str(uuid4()), "selectedIndex": 0},
    )
    assert correct.json()["correct"] and not correct.json()["refresher"]
    assert correct.json()["remainingSteps"] == 3
    # Manual early practice remains possible and successful recall widens spacing.
    third = (await client.post(f"/api/v1/memory/{review['id']}/prepare")).json()
    more = await client.post(
        f"/api/v1/memory/{review['id']}/answer",
        json={"checkId": third["id"], "submissionId": str(uuid4()), "selectedIndex": 0},
    )
    assert more.json()["remainingSteps"] == 6
    assert (await client.get(f"/api/v1/projects/{project_id}/roadmap")).json() == before
    async with app.state.session_factory() as db:
        assert len(list(await db.scalars(select(MemoryReview)))) == 1
        assert len(list(await db.scalars(select(RoadmapMap)))) == 1


async def test_old_skill_gap_uses_micro_review_not_new_branch(client, project_id):
    _, child, python = await prepare_ml(client, project_id)
    passed, _ = await answer_test(client, project_id, python["id"])
    assert passed.json()["passed"]
    functions = next(n for n in passed.json()["map"]["nodes"] if n["title"] == "Fonksiyonlar")
    failed, body = await answer_test(client, project_id, functions["id"], "python.functions")
    assert failed.status_code == 200, failed.text
    result = failed.json()
    assert not result["passed"] and result["memoryReviewIds"]
    assert result["adaptiveMap"] is None and not result["remediationCreated"]
    assert next(n for n in result["map"]["nodes"] if n["id"] == python["id"])["status"] == "completed"
    assert (await client.post(f"/api/v1/nodes/{functions['id']}/assessment/submit", json=body)).json() == result
    due = next(r for r in (await machine(client, project_id))["reviews"] if r["id"] in result["memoryReviewIds"])
    assert due["due"] and due["status"] == "refresher"
    passed_again, _ = await answer_test(client, project_id, functions["id"])
    assert passed_again.json()["passed"]


async def test_memory_is_project_and_user_scoped(client, app, project_id):
    await learned_root(client, project_id)
    review = (await machine(client, project_id))["reviews"][0]
    quiz = (await client.post(f"/api/v1/memory/{review['id']}/prepare")).json()
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test", headers={"X-Demo-Session": str(uuid4())}
    ) as stranger:
        assert (await stranger.get(f"/api/v1/projects/{project_id}/time-machine")).status_code == 404
        assert (await stranger.post(f"/api/v1/memory/{review['id']}/prepare")).status_code == 404
        response = await stranger.post(
            f"/api/v1/memory/{review['id']}/answer",
            json={"checkId": quiz["id"], "submissionId": str(uuid4()), "selectedIndex": 0},
        )
        assert response.status_code == 404


async def test_review_rejects_original_question_or_wrong_skill(client, app, project_id):
    await learned_root(client, project_id)
    review = (await machine(client, project_id))["reviews"][0]
    from app.schemas.memory import MemoryDraft
    from app.seed.demo import fixture

    draft = MemoryDraft.model_validate(fixture("memory_review", {"skill": review["skill"]}))
    draft.question.target_skill = "unrelated.skill"
    app.state.gateway.generate_structured = AsyncMock(return_value=draft)
    assert (await client.post(f"/api/v1/memory/{review['id']}/prepare")).status_code == 502
    draft.question.target_skill = review["skill"]
    draft.question.prompt = "JavaScript içinde blok kapsamlı değişken hangi anahtar kelimeyle tanımlanır?"
    assert (await client.post(f"/api/v1/memory/{review['id']}/prepare")).status_code == 502


@pytest.mark.parametrize("index", [-1, 9, True])
async def test_review_rejects_invalid_answers(client, project_id, index):
    await learned_root(client, project_id)
    review = (await machine(client, project_id))["reviews"][0]
    quiz = (await client.post(f"/api/v1/memory/{review['id']}/prepare")).json()
    response = await client.post(
        f"/api/v1/memory/{review['id']}/answer",
        json={"checkId": quiz["id"], "submissionId": str(uuid4()), "selectedIndex": index},
    )
    assert response.status_code == 422
