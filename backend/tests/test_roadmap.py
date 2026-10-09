import asyncio

from conftest import finish_discovery

from app.graph.validator import validate_bundle
from app.schemas.export import ExportBundle


async def test_root_submap_export(client, project_id):
    path = f"/api/v1/projects/{project_id}/roadmap/generate"
    assert (await client.post(path)).status_code == 409
    await finish_discovery(client, project_id)
    results = await asyncio.gather(client.post(path), client.post(path))
    assert all(r.status_code == 200 for r in results), [r.text for r in results]
    root = results[0].json()
    assert root["id"] == results[1].json()["id"]
    node = next(n for n in root["nodes"] if n["type"] == "submap" and "Machine" in n["title"])
    results = await asyncio.gather(*[client.post(f"/api/v1/nodes/{node['id']}/submap") for _ in range(2)])
    assert all(r.status_code == 200 for r in results), [r.text for r in results]
    child = results[0].json()
    assert child["id"] == results[1].json()["id"]
    assert child["parentMapId"] == root["id"]
    assert child["parentNodeId"] == node["id"]
    exported = (await client.get(f"/api/v1/projects/{project_id}/export")).json()
    assert len(exported["maps"]) == 2
    validate_bundle(ExportBundle.model_validate(exported))
    assert (await client.get(f"/api/v1/maps/{child['id']}")).status_code == 200


async def test_ai_invalid_graph_is_not_persisted(client, app, project_id, monkeypatch):
    await finish_discovery(client, project_id)
    original = app.state.gateway.generate_structured

    async def invalid(operation, *args, **kwargs):
        result = await original(operation, *args, **kwargs)
        if operation == "roadmap":
            result.edges[0].target = "missing"
        return result

    monkeypatch.setattr(app.state.gateway, "generate_structured", invalid)
    response = await client.post(f"/api/v1/projects/{project_id}/roadmap/generate")
    assert response.status_code == 502
    assert (await client.get(f"/api/v1/projects/{project_id}/roadmap")).status_code == 404
    assert (await client.get(f"/api/v1/projects/{project_id}")).json()["status"] == "failed"
