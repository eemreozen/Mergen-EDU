import asyncio
from uuid import uuid4

from test_assessment import answer_test, prepare_ml

from app.graph.validator import validate_bundle
from app.schemas.export import ExportBundle


async def complete_branch(client, project_id, branch):
    for _ in range(20):
        current = (await client.get(f"/api/v1/maps/{branch['id']}")).json()
        remaining = [n for n in current["nodes"] if n["status"] != "completed"]
        if not remaining:
            return
        node = next(n for n in remaining if n["status"] in {"available", "in_progress", "needs_review"})
        response, _ = await answer_test(client, project_id, node["id"])
        assert response.status_code == 200, response.text
    raise AssertionError("Branch not completed")


async def test_remediation_complete_cycle(client, project_id):
    root, child, python = await prepare_ml(client, project_id)
    parent_before = (await client.get(f"/api/v1/maps/{child['id']}")).json()
    failed, body = await answer_test(client, project_id, python["id"], "python.functions")
    assert failed.status_code == 200, failed.text
    result = failed.json()
    branch = result["adaptiveMap"]
    assert not result["passed"] and result["score"] == 66.67
    assert branch["kind"] == "adaptive" and branch["targetNodeId"] == python["id"]
    assert branch["weakSkills"] == ["python.functions"]
    assert branch["parentMapId"] == child["id"] and branch["parentNodeId"] is None
    assert {s for n in branch["nodes"] for s in n["skills"]} == {"python.functions"}
    assert [n["id"] for n in parent_before["nodes"]] == [n["id"] for n in result["map"]["nodes"]]
    assert parent_before["edges"] == result["map"]["edges"]
    assert (await client.post(f"/api/v1/nodes/{python['id']}/assessment/submit", json=body)).json() == result
    body["submissionId"] = str(uuid4())
    assert (
        await client.post(f"/api/v1/nodes/{python['id']}/assessment/submit", json=body)
    ).status_code == 409
    branch_node = branch["nodes"][0]
    failed_inside, _ = await answer_test(client, project_id, branch_node["id"], "python.functions")
    assert failed_inside.status_code == 200
    assert failed_inside.json()["adaptiveMap"] is None
    await complete_branch(client, project_id, branch)
    parent = (await client.get(f"/api/v1/maps/{child['id']}")).json()
    assert next(n for n in parent["nodes"] if n["title"] == "Fonksiyonlar")["status"] == "locked"
    # Yeniden yanlış cevap aynı dalı kullanır; yeni ana harita veya sonsuz dal oluşmaz.
    failed_again, _ = await answer_test(client, project_id, python["id"], "python.functions")
    assert failed_again.json()["adaptiveMap"]["id"] == branch["id"]
    await complete_branch(client, project_id, branch)
    passed, _ = await answer_test(client, project_id, python["id"])
    assert passed.json()["passed"]
    assert (
        next(n for n in passed.json()["map"]["nodes"] if n["title"] == "Fonksiyonlar")["status"]
        == "available"
    )
    bundle = (await client.get(f"/api/v1/projects/{project_id}/export")).json()
    validate_bundle(ExportBundle.model_validate(bundle))
    assert len([m for m in bundle["maps"] if m["kind"] == "adaptive"]) == 1


async def test_learn_from_scratch_is_idempotent_and_persistent(client, app, project_id):
    _, child, python = await prepare_ml(client, project_id)
    responses = await asyncio.gather(*[client.post(f"/api/v1/nodes/{python['id']}/learn") for _ in range(2)])
    assert all(r.status_code == 200 for r in responses), [r.text for r in responses]
    branch = responses[0].json()
    assert responses[1].json()["id"] == branch["id"]
    assert branch["trigger"] == "learn_from_scratch"
    assert set(branch["weakSkills"]) == set(python["skills"])
    assert len(branch["nodes"]) >= 2
    await complete_branch(client, project_id, branch)
    response, _ = await answer_test(client, project_id, python["id"])
    assert response.json()["passed"]
    bundle = (await client.get(f"/api/v1/projects/{project_id}/export")).json()
    validate_bundle(ExportBundle.model_validate(bundle))


async def test_new_weak_skill_extends_connected_branch(client, project_id):
    _, _, python = await prepare_ml(client, project_id)
    first, _ = await answer_test(client, project_id, python["id"], "python.functions")
    assert first.status_code == 200, first.text
    branch = first.json()["adaptiveMap"]
    old_ids = {node["id"] for node in branch["nodes"]}
    await complete_branch(client, project_id, branch)

    second, _ = await answer_test(client, project_id, python["id"], "python.basics")
    assert second.status_code == 200, second.text
    extended = second.json()["adaptiveMap"]
    assert extended["id"] == branch["id"]
    new_ids = {node["id"] for node in extended["nodes"]} - old_ids
    assert new_ids
    assert any(
        edge["source"] in old_ids and edge["target"] in new_ids and edge["kind"] == "requires"
        for edge in extended["edges"]
    )
    reachable = set(old_ids)
    for _ in extended["nodes"]:
        reachable |= {edge["target"] for edge in extended["edges"] if edge["source"] in reachable}
    assert new_ids <= reachable
    await complete_branch(client, project_id, extended)
    passed, _ = await answer_test(client, project_id, python["id"])
    assert passed.json()["passed"]
    bundle = (await client.get(f"/api/v1/projects/{project_id}/export")).json()
    validate_bundle(ExportBundle.model_validate(bundle))
    assert len([m for m in bundle["maps"] if m["kind"] == "adaptive"]) == 1


async def test_child_completion_propagates(client, project_id):
    root, child, _ = await prepare_ml(client, project_id)
    for _ in range(10):
        current = (await client.get(f"/api/v1/maps/{child['id']}")).json()
        remaining = [n for n in current["nodes"] if n["status"] != "completed"]
        if not remaining:
            break
        node = next(n for n in remaining if n["status"] in {"available", "in_progress"})
        if node["type"] == "development_task":
            response = await client.patch(
                f"/api/v1/nodes/{node['id']}",
                json={"action": "complete_task", "expectedOutput": "Çalışan model ve test çıktısı"},
            )
        else:
            response, _ = await answer_test(client, project_id, node["id"])
        assert response.status_code == 200, response.text
    parent = (await client.get(f"/api/v1/maps/{root['id']}")).json()
    assert next(n for n in parent["nodes"] if n["childMapId"] == child["id"])["status"] == "completed"
