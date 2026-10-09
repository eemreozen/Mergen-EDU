from types import SimpleNamespace

import pytest
from conftest import finish_discovery
from test_assessment import prepare_ml

from app.models.roadmap import RoadmapMap, RoadmapNode
from app.services.branch_scope import branch_scope, same_topic, topic_conflicts


@pytest.mark.parametrize(
    "title", ["OpenCV ile Görüntü İşleme", "Görüntü İşleme (OpenCV)", "OpenCV: temel filtreler"]
)
def test_renamed_sibling_cannot_become_a_python_lesson(title):
    scope = {
        "anchor": {"title": "Python Temelleri", "skills": ["python.basics"]},
        "otherRoadmapTopics": [{"title": "OpenCV ile Görüntü İşleme", "skills": ["python.opencv"]}],
    }
    assert topic_conflicts(SimpleNamespace(title=title, skills=["python.basics"]), scope)
    assert not topic_conflicts(SimpleNamespace(title="Python: koşullar ve döngüler"), scope)
    assert same_topic("OpenCV ile Görüntü İşleme", "OPENCV ILE GORUNTU ISLEME")


async def test_adaptive_copy_is_repaired_without_another_ai_call(client, app, project_id, monkeypatch):
    root, child, python = await prepare_ml(client, project_id)
    before = (await client.get(f"/api/v1/maps/{root['id']}")).json()
    async with app.state.session_factory() as db:
        db.add(
            RoadmapNode(
                map_id=child["id"],
                key="opencv",
                title="OpenCV ile Görüntü İşleme",
                summary="Görüntü filtreleme",
                skills=["python.opencv"],
                estimated_hours=3,
                type="learning",
                status="available",
            )
        )
        await db.commit()
    original = app.state.gateway.generate_structured
    calls = []

    async def copied(operation, system, payload, schema):
        calls.append(operation)
        draft = await original(operation, system, payload, schema)
        assert payload["node"]["summary"] == python["summary"]
        topics = payload["branchScope"]["otherRoadmapTopics"]
        assert any(n["title"] == "OpenCV ile Görüntü İşleme" for n in topics)
        assert any(n["title"] == "Backend" for n in topics), "Ancestor siblings must be included"
        draft.nodes[-1].title = "OpenCV: temel filtreler"
        draft.nodes[-1].summary = "OpenCV ile görüntü filtrele."
        return draft

    monkeypatch.setattr(app.state.gateway, "generate_structured", copied)
    response = await client.post(f"/api/v1/nodes/{python['id']}/learn")
    assert response.status_code == 200, response.text
    branch = response.json()
    assert calls == ["adaptive_roadmap"]
    assert all(
        "opencv" not in n["title"].casefold() and "OpenCV" not in n["summary"] for n in branch["nodes"]
    )
    assert {s for n in branch["nodes"] for s in n["skills"]} == set(python["skills"])
    assert len(branch["edges"]) == len(branch["nodes"]) - 1
    assert (await client.post(f"/api/v1/nodes/{python['id']}/learn")).json()["id"] == branch["id"]
    assert calls == ["adaptive_roadmap"]
    current = (await client.get(f"/api/v1/maps/{root['id']}")).json()
    assert current["nodes"] == before["nodes"]


async def test_cached_unused_duplicate_is_fixed_but_studied_content_is_kept(
    client, app, project_id, monkeypatch
):
    _, child, python = await prepare_ml(client, project_id)
    branch = (await client.post(f"/api/v1/nodes/{python['id']}/learn")).json()
    async with app.state.session_factory() as db:
        # Fonksiyonlar belongs to the parent map. Give two old branch lessons
        # that copied title; only the unopened one may be repaired.
        first = await db.get(RoadmapNode, branch["nodes"][0]["id"])
        first.title = "Fonksiyonlar"
        first.content = {"lesson": "Already studied lesson"}
        last = await db.get(RoadmapNode, branch["nodes"][-1]["id"])
        last.title = "Fonksiyonlar"
        await db.commit()

    async def no_ai(*args):
        raise AssertionError("Cached repair must not call AI")

    monkeypatch.setattr(app.state.gateway, "generate_structured", no_ai)
    updated = await client.post(f"/api/v1/nodes/{python['id']}/learn")
    assert updated.status_code == 200, updated.text
    updated = updated.json()
    assert updated["id"] == branch["id"] and updated["edges"] == branch["edges"]
    assert updated["nodes"][0]["title"] == "Fonksiyonlar"
    assert updated["nodes"][0]["lesson"] == "Already studied lesson"
    assert updated["nodes"][-1]["title"] != "Fonksiyonlar"
    assert [n["status"] for n in updated["nodes"]] == [n["status"] for n in branch["nodes"]]


async def test_submap_cannot_copy_another_main_stage(client, app, project_id, monkeypatch):
    await finish_discovery(client, project_id)
    root = (await client.post(f"/api/v1/projects/{project_id}/roadmap/generate")).json()
    ml = next(n for n in root["nodes"] if n["title"] == "Machine Learning")
    original = app.state.gateway.generate_structured

    async def copied(operation, system, payload, schema):
        draft = await original(operation, system, payload, schema)
        draft.nodes[0].title = "Programlama Temelleri"
        return draft

    monkeypatch.setattr(app.state.gateway, "generate_structured", copied)
    response = await client.post(f"/api/v1/nodes/{ml['id']}/submap")
    assert response.status_code == 502 and response.json()["error"]["code"] == "AI_INVALID_OUTPUT"
    async with app.state.session_factory() as db:
        node = await db.get(RoadmapNode, ml["id"])
        assert node.child_map_id is None
        scope = await branch_scope(db, await db.get(RoadmapMap, node.map_id), node)
        assert len(scope["otherRoadmapTopics"]) == len(root["nodes"]) - 1
