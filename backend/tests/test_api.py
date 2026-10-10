from conftest import finish_discovery

from app.schemas.export import ExportBundle


async def test_health(client):
    for path in ["/health", "/api/v1/health"]:
        assert (await client.get(path)).json()["status"] == "ok"


async def test_project_and_export(client, project_id):
    project = (await client.get(f"/api/v1/projects/{project_id}")).json()
    assert project["primaryDomain"] == "mobile"
    assert project["metadata"]["demo"]
    assert len((await client.get("/api/v1/projects")).json()) == 1
    exported = (await client.get(f"/api/v1/projects/{project_id}/export")).json()
    ExportBundle.model_validate(exported)
    assert exported["schemaVersion"] == "mergen/v1"


async def test_discovery(client, project_id):
    questions = (await client.get(f"/api/v1/projects/{project_id}/discovery")).json()["questions"]
    assert {"experience", "hours"} == {
        q["id"] for q in questions if q["section"] == "advisor" and q["required"]
    }
    assert not {"mobile_stack", "ai_strategy", "preferred_stack"} & {q["id"] for q in questions}
    await finish_discovery(client, project_id)
    project = (await client.get(f"/api/v1/projects/{project_id}")).json()
    assert project["status"] == "ready_for_roadmap"
    exported = (await client.get(f"/api/v1/projects/{project_id}/export")).json()
    assert exported["learnerProfile"]["weeklyHours"] == 10
    assert exported["learnerProfile"]["verifiedSkills"] == []
    assert exported["learnerProfile"]["selfReportedSkills"] == ["javascript.basics"]


async def test_owner_and_validation(client, project_id):
    from uuid import uuid4

    assert (
        await client.get(f"/api/v1/projects/{project_id}", headers={"X-Demo-Session": str(uuid4())})
    ).status_code == 404
    assert (await client.get("/api/v1/projects", headers={"X-Demo-Session": "bad"})).status_code == 401
    response = await client.post(
        f"/api/v1/projects/{project_id}/discovery/answers",
        json={"answers": [{"questionId": "hours", "value": "999"}]},
    )
    assert response.status_code == 422
    assert "error" in response.json()


async def test_missing_api_key(app, client):
    from app.ai.gateway import AIGateway
    from app.config import Settings

    app.state.gateway = AIGateway(Settings(demo_fixtures=False, llm_api_key=""))
    result = await client.post("/api/v1/projects", json={"idea": "Bir web uygulaması geliştirmek istiyorum."})
    assert result.status_code == 503
    assert result.json()["error"]["code"] == "AI_NOT_CONFIGURED"
    assert (await client.get("/api/v1/projects")).json() == []
