import asyncio
from uuid import uuid4

from test_assessment import prepare_ml

from app.errors import AppError


async def test_all_graph_endpoints_enforce_ownership(client, project_id):
    root, child, python = await prepare_ml(client, project_id)
    other = {"X-Demo-Session": str(uuid4())}
    for path in [
        f"/projects/{project_id}",
        f"/projects/{project_id}/discovery",
        f"/projects/{project_id}/roadmap",
        f"/projects/{project_id}/export",
        f"/maps/{root['id']}",
        f"/nodes/{python['id']}",
        f"/nodes/{python['id']}/resources",
        f"/nodes/{python['id']}/assessment",
    ]:
        response = await client.get("/api/v1" + path, headers=other)
        assert response.status_code == 404, (path, response.text)
    for path in [f"/projects/{project_id}/roadmap/generate", f"/nodes/{python['id']}/submap"]:
        assert (await client.post("/api/v1" + path, headers=other)).status_code == 404
    advisor = await client.post(
        "/api/v1/advisor/chat", headers=other, json={"projectId": project_id, "message": "Yardım et"}
    )
    assert advisor.status_code == 404


async def test_lazy_generation_concurrency(client, project_id):
    _, _, python = await prepare_ml(client, project_id)
    results = await asyncio.gather(
        *[client.get(f"/api/v1/nodes/{python['id']}/assessment") for _ in range(3)]
    )
    assert all(r.status_code == 200 for r in results), [r.text for r in results]
    assert len({r.json()["id"] for r in results}) == 1
    details = await asyncio.gather(*[client.get(f"/api/v1/nodes/{python['id']}") for _ in range(2)])
    assert details[0].json() == details[1].json()


async def test_generated_content_failure_rolls_back(client, app, project_id, monkeypatch):
    _, _, python = await prepare_ml(client, project_id)
    original = app.state.gateway.generate_structured

    async def fail(operation, *args):
        if operation == "node_content":
            raise AppError("AI_TIMEOUT", "AI isteği zaman aşımına uğradı.", 504, True)
        return await original(operation, *args)

    monkeypatch.setattr(app.state.gateway, "generate_structured", fail)
    response = await client.get(f"/api/v1/nodes/{python['id']}")
    assert response.status_code == 504
    monkeypatch.setattr(app.state.gateway, "generate_structured", original)
    assert (await client.get(f"/api/v1/nodes/{python['id']}")).status_code == 200


async def test_non_fixture_project_cannot_export_answers(client, app, project_id):
    from app.models.project import Project

    async with app.state.session_factory() as db:
        project = await db.get(Project, project_id)
        project.is_demo = False
        await db.commit()
    assert (await client.get(f"/api/v1/projects/{project_id}/export?mode=demo")).status_code == 403
    assert (await client.get(f"/api/v1/projects/{project_id}/export")).status_code == 200


async def test_task_completion_requires_evidence_and_correct_node_type(client, project_id):
    _, _, python = await prepare_ml(client, project_id)
    result = await client.patch(f"/api/v1/nodes/{python['id']}", json={"action": "complete_task"})
    assert result.status_code == 422
    result = await client.patch(
        f"/api/v1/nodes/{python['id']}", json={"action": "complete_task", "expectedOutput": "Bir çıktı"}
    )
    assert result.status_code == 409


async def test_swagger_contract(client):
    spec = (await client.get("/openapi.json")).json()
    assert spec["paths"]["/api/v1/projects"]["post"]["responses"]["201"]
    assert "correctIndex" not in str(spec["components"]["schemas"]["PublicQuestion"])
    assert (await client.get("/docs")).status_code == 200
