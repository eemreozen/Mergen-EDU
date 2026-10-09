from uuid import uuid4

from test_assessment import answer_test, prepare_ml

from app.graph.validator import validate_bundle
from app.schemas.export import ExportBundle


async def test_remediation_complete_cycle(client, project_id):
    root, child, python = await prepare_ml(client, project_id)
    failed, body = await answer_test(client, project_id, python["id"], "python.functions")
    assert failed.status_code == 200, failed.text
    result = failed.json()
    assert not result["passed"] and result["score"] == 66.67
    assert result["weakSkills"] == ["python.functions"]
    assert result["remediationCreated"]
    remedial = next(n for n in result["map"]["nodes"] if n["type"] == "remedial")
    assert remedial["remediationForNodeId"] == python["id"]
    assert remedial["skills"] == ["python.functions"]
    assert any(e["source"] == remedial["id"] and e["target"] == python["id"] for e in result["map"]["edges"])
    retry = await client.post(f"/api/v1/nodes/{python['id']}/assessment/submit", json=body)
    assert retry.json() == result
    body["submissionId"] = str(uuid4())
    assert (
        await client.post(f"/api/v1/nodes/{python['id']}/assessment/submit", json=body)
    ).status_code == 409
    content = await client.get(f"/api/v1/nodes/{remedial['id']}")
    assert content.status_code == 200
    failed_remedy, _ = await answer_test(client, project_id, remedial["id"], "python.functions")
    assert not failed_remedy.json()["remediationCreated"]
    assert len([n for n in failed_remedy.json()["map"]["nodes"] if n["type"] == "remedial"]) == 1
    passed, _ = await answer_test(client, project_id, remedial["id"])
    assert passed.json()["passed"]
    current = (await client.get(f"/api/v1/maps/{child['id']}")).json()
    assert next(n for n in current["nodes"] if n["title"] == "Fonksiyonlar")["status"] == "locked"
    passed, _ = await answer_test(client, project_id, python["id"])
    assert passed.status_code == 200 and passed.json()["passed"]
    assert (
        next(n for n in passed.json()["map"]["nodes"] if n["title"] == "Fonksiyonlar")["status"]
        == "available"
    )
    export = (await client.get(f"/api/v1/projects/{project_id}/export")).json()
    validate_bundle(ExportBundle.model_validate(export))
    assert "python.functions" in export["learnerProfile"]["verifiedSkills"]


async def test_child_completion_propagates(client, project_id):
    root, child, python = await prepare_ml(client, project_id)
    for _ in range(10):
        current = (await client.get(f"/api/v1/maps/{child['id']}")).json()
        pending = [n for n in current["nodes"] if n["status"] != "completed"]
        if not pending:
            break
        node = next(n for n in pending if n["status"] in ["available", "in_progress"])
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
