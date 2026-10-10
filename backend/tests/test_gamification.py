from uuid import uuid4

from test_assessment import answer_test, prepare_ml


async def test_practice_pass_and_fail_leave_progress_untouched(client, app, project_id):
    _, child, _ = await prepare_ml(client, project_id)
    node = next(n for n in child["nodes"] if n["status"] == "locked")
    before_map = (await client.get(f"/api/v1/maps/{child['id']}")).json()
    before_points = (await client.get("/api/v1/me/progress")).json()
    assert before_points["practiceEnabled"]
    assert (await client.get(f"/api/v1/nodes/{node['id']}/assessment")).status_code == 409
    quiz_response = await client.get(f"/api/v1/nodes/{node['id']}/assessment?practice=true")
    assert quiz_response.status_code == 200, quiz_response.text
    quiz = quiz_response.json()
    internal = (await client.get(f"/api/v1/projects/{project_id}/export?mode=demo")).json()
    questions = next(a["questions"] for a in internal["assessments"] if a["id"] == quiz["id"])

    async def forbid_generation(*args):
        raise AssertionError("Practice must not generate remediation or update memory")

    before_map = (await client.get(f"/api/v1/maps/{child['id']}")).json()
    assert next(n for n in before_map["nodes"] if n["id"] == node["id"])["status"] == "locked"
    app.state.gateway.generate_structured = forbid_generation
    for wrong in (False, True):
        result = await client.post(
            f"/api/v1/nodes/{node['id']}/assessment/submit",
            json={
                "practice": True,
                "assessmentId": quiz["id"],
                "version": quiz["version"],
                "submissionId": str(uuid4()),
                "answers": [
                    {
                        "questionId": q["id"],
                        "selectedIndex": (q["correctIndex"] + int(wrong)) % len(q["options"]),
                    }
                    for q in questions
                ],
            },
        )
        assert result.status_code == 200, result.text
        assert result.json()["practice"] and result.json()["pointsAwarded"] == 0
        assert result.json()["passed"] is not wrong
        assert result.json()["adaptiveMap"] is None
    after_map = (await client.get(f"/api/v1/maps/{child['id']}")).json()
    assert before_map == after_map
    assert (await client.get("/api/v1/me/progress")).json() == before_points
    assert len((await client.get(f"/api/v1/projects/{project_id}/export")).json()["assessments"]) == 1
    from sqlalchemy import func, select

    from app.models.assessment import AssessmentAttempt

    async with app.state.session_factory() as db:
        assert await db.scalar(select(func.count()).select_from(AssessmentAttempt)) == 0


async def test_real_success_rewards_once_and_survives_reload(client, project_id):
    _, _, node = await prepare_ml(client, project_id)
    before = (await client.get("/api/v1/me/progress")).json()
    response, body = await answer_test(client, project_id, node["id"])
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["pointsAwarded"] == result["correctAnswers"] * 10 + 25
    after = (await client.get("/api/v1/me/progress")).json()
    assert after["totalPoints"] - before["totalPoints"] == result["pointsAwarded"]
    retry = await client.post(f"/api/v1/nodes/{node['id']}/assessment/submit", json=body)
    assert retry.json() == result
    assert (await client.get("/api/v1/me/progress")).json() == after
    body["submissionId"] = str(uuid4())
    assert (await client.post(f"/api/v1/nodes/{node['id']}/assessment/submit", json=body)).status_code == 409
    assert (await client.get("/api/v1/me/progress", headers={"X-Demo-Session": str(uuid4())})).json()[
        "totalPoints"
    ] == 0


async def test_practice_cannot_bypass_ownership_or_production_mode(client, app, project_id):
    _, child, _ = await prepare_ml(client, project_id)
    node = next(n for n in child["nodes"] if n["status"] == "locked")
    url = f"/api/v1/nodes/{node['id']}/assessment?practice=true"
    assert (await client.get(url, headers={"X-Demo-Session": str(uuid4())})).status_code == 404
    app.state.settings.app_env = "production"
    assert (await client.get(url)).status_code == 403
    assert (await client.get(f"/api/v1/nodes/{node['id']}?practice=true")).status_code == 403
