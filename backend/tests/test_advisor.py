from test_assessment import answer_test, prepare_ml


async def test_advisor_uses_real_failure_context(client, app, project_id, monkeypatch):
    root, child, python = await prepare_ml(client, project_id)
    failed, _ = await answer_test(client, project_id, python["id"], "python.functions")
    remedial = next(n for n in failed.json()["map"]["nodes"] if n["type"] == "remedial")
    original = app.state.gateway.generate_structured
    captured = {}

    async def capture(operation, prompt, payload, model):
        if operation == "advisor":
            captured.update(payload)
        return await original(operation, prompt, payload, model)

    monkeypatch.setattr(app.state.gateway, "generate_structured", capture)
    result = await client.post(
        "/api/v1/advisor/chat",
        json={
            "projectId": project_id,
            "currentMapId": child["id"],
            "currentNodeId": remedial["id"],
            "message": "Bu ek görev neden eklendi?",
        },
    )
    assert result.status_code == 200, result.text
    assert "python.functions" in result.json()["reply"]
    assert captured["lastAssessment"]["weakSkills"] == ["python.functions"]
    assert captured["lastAssessment"]["score"] == 66.67
    assert captured["remediationReason"]["originalNodeId"] == python["id"]
    assert all(s["skill"] != "javascript.basics" for s in captured["skills"])
    assert "answers" not in captured and "questions" not in captured
    assert result.json()["suggestedActions"] == []


async def test_cross_project_advisor_context_is_rejected(client, project_id):
    root, child, python = await prepare_ml(client, project_id)
    other = (
        await client.post(
            "/api/v1/projects", json={"idea": "Başka bir web uygulaması geliştirmek istiyorum."}
        )
    ).json()["id"]
    result = await client.post(
        "/api/v1/advisor/chat",
        json={"projectId": other, "currentNodeId": python["id"], "message": "Yardım et"},
    )
    assert result.status_code == 422
