import pytest
from pydantic import ValidationError

from app.graph.validator import validate_graph
from app.schemas.roadmap import RoadmapDraft


def draft(edges):
    return RoadmapDraft(
        title="Test",
        description="Test",
        nodes=[
            dict(key=key, title=key, summary=key, type="learning", skills=["python.basics"], estimatedHours=1)
            for key in ["a", "b"]
        ],
        edges=edges,
    )


@pytest.mark.parametrize(
    "edges",
    [
        [{"source": "a", "target": "missing", "kind": "requires"}],
        [
            {"source": "a", "target": "b", "kind": "requires"},
            {"source": "b", "target": "a", "kind": "requires"},
        ],
        [{"source": "a", "target": "a", "kind": "supports"}],
    ],
)
def test_invalid_graph(edges):
    with pytest.raises(ValidationError):
        draft(edges)


def test_supports_do_not_cycle_gate():
    graph = draft(
        [
            {"source": "a", "target": "b", "kind": "requires"},
            {"source": "b", "target": "a", "kind": "supports"},
        ]
    )
    validate_graph(graph.nodes, graph.edges)


def test_generated_draft_rejects_disconnected_components():
    with pytest.raises(ValidationError, match="kopuk"):
        draft([])
    connected = draft([{"source": "a", "target": "b", "kind": "supports"}])
    # Optional integration is sufficient; it must not lock independent lessons.
    validate_graph(connected.nodes, connected.edges, require_connected=True)


def test_legacy_graph_can_still_be_read():
    from types import SimpleNamespace

    nodes = [SimpleNamespace(id="old-a"), SimpleNamespace(id="old-b")]
    validate_graph(nodes, [])
    from app.errors import AppError

    with pytest.raises(AppError):
        validate_graph(nodes, [], require_connected=True)
