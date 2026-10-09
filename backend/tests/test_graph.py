import pytest

from app.errors import AppError
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
    graph = draft(edges)
    with pytest.raises(AppError):
        validate_graph(graph.nodes, graph.edges)


def test_supports_do_not_cycle_gate():
    graph = draft(
        [
            {"source": "a", "target": "b", "kind": "requires"},
            {"source": "b", "target": "a", "kind": "supports"},
        ]
    )
    validate_graph(graph.nodes, graph.edges)
