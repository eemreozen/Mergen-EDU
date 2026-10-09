from types import SimpleNamespace

import pytest
from conftest import finish_discovery
from test_assessment import answer_test

from app.graph.validator import validate_graph
from app.services.topic_expansion import broad_topic, expand_topic


@pytest.mark.parametrize(
    "title,expected",
    [
        ("Backend Geliştirme", "backend"),
        ("Frontend", "frontend"),
        ("Backend JWT doğrulama", None),
        ("Frontend component test", None),
        ("FastAPI endpoint tasarımı", None),
        ("Python Temelleri", None),
    ],
)
def test_broad_topic(title, expected):
    assert broad_topic(SimpleNamespace(type="learning", title=title)) == expected


@pytest.mark.parametrize(
    "topic,choices,technology",
    [
        ("backend", {"stack": "Django", "database": "MongoDB"}, "Django"),
        ("frontend", {"stack": "Vue"}, "Vue"),
    ],
)
def test_deterministic_curriculum(topic, choices, technology):
    project = SimpleNamespace(
        title="Fitness", original_idea="Antrenman planı", analysis={"goal": "Antrenman takibi"}, locale="tr"
    )
    draft = expand_topic(topic, project, choices)
    assert draft == expand_topic(topic, project, choices)
    validate_graph(draft.nodes, draft.edges)
    assert len(draft.nodes) >= 8
    assert any(technology in n.title for n in draft.nodes)
    assert all("Antrenman takibi" in n.summary for n in draft.nodes)
    incoming = {e.target for e in draft.edges}
    assert len([n for n in draft.nodes if n.key not in incoming]) >= 2
    assert all(n.type == "learning" for n in draft.nodes)


async def test_saved_backend_expands_without_ai_and_is_cached(client, app, project_id, monkeypatch):
    await finish_discovery(client, project_id)
    root = (await client.post(f"/api/v1/projects/{project_id}/roadmap/generate")).json()
    backend = next(n for n in root["nodes"] if n["title"] == "Backend")
    assert backend["type"] == "submap"
    assert (await client.post(f"/api/v1/nodes/{backend['id']}/submap")).status_code == 409
    basics = next(n for n in root["nodes"] if "Programlama" in n["title"])
    await answer_test(client, project_id, basics["id"])

    async def no_ai(*args, **kwargs):
        raise AssertionError("Deterministic expansion must not call Gemini")

    monkeypatch.setattr(app.state.gateway, "generate_structured", no_ai)
    response = await client.post(f"/api/v1/nodes/{backend['id']}/submap")
    assert response.status_code == 200, response.text
    child = response.json()
    assert child["parentNodeId"] == backend["id"]
    assert child["parentMapId"] == root["id"]
    assert len(child["nodes"]) == 8
    assert (await client.post(f"/api/v1/nodes/{backend['id']}/submap")).json()["id"] == child["id"]

    from test_remediation import complete_branch

    monkeypatch.undo()
    await complete_branch(client, project_id, child)
    updated = (await client.get(f"/api/v1/projects/{project_id}/export")).json()
    parent = next(n for m in updated["maps"] for n in m["nodes"] if n["id"] == backend["id"])
    assert parent["status"] == "completed"
