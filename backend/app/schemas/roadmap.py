from typing import Literal

from pydantic import Field, model_validator

from app.schemas.common import Metadata, Schema

NodeType = Literal["learning", "development_task", "submap", "milestone", "remedial"]
NodeStatus = Literal["locked", "available", "in_progress", "completed", "needs_review"]


class PracticalTask(Schema):
    description: str
    expected_output: str


class NodeContent(Schema):
    lesson: str = Field(min_length=100, max_length=10000)
    why_needed: str
    learning_objectives: list[str] = Field(min_length=1)
    subtopics: list[str]
    practical_task: PracticalTask


class NodeDraft(Schema):
    key: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9_.-]+$")
    type: NodeType
    title: str = Field(min_length=1, max_length=50)
    summary: str = Field(min_length=1, max_length=500)
    skills: list[str] = Field(min_length=1, max_length=5)
    estimated_hours: float = Field(gt=0, le=500)
    resource_query: str = Field(default="", max_length=160)


class EdgeDraft(Schema):
    source: str
    target: str
    kind: Literal["requires", "supports"]


class RoadmapDraft(Schema):
    title: str
    description: str
    nodes: list[NodeDraft] = Field(min_length=2, max_length=24)
    edges: list[EdgeDraft] = Field(max_length=80)

    @model_validator(mode="after")
    def connected_learning_graph(self):
        # Provider validation participates in the gateway's bounded retry policy.
        # Saved legacy exports remain readable; only new drafts are strict.
        from app.errors import AppError
        from app.graph.validator import validate_graph

        try:
            validate_graph(self.nodes, self.edges, require_connected=True)
        except AppError as exc:
            raise ValueError(exc.message) from exc
        return self


class RootRoadmapDraft(RoadmapDraft):
    @model_validator(mode="before")
    @classmethod
    def decode_generation_slots(cls, value):
        if isinstance(value, dict) and isinstance(value.get("nodes"), dict):
            slots = value["nodes"]
            keys = {slot: node.get("key", slot) for slot, node in slots.items()}
            value = {**value, "nodes": [node for _, node in sorted(slots.items())],
                     "edges": [{**edge, "source": keys.get(edge.get("source"), edge.get("source")),
                                "target": keys.get(edge.get("target"), edge.get("target"))}
                               for edge in value.get("edges", [])]}
        return value

    nodes: list[NodeDraft] = Field(min_length=12, max_length=24)


class AdaptiveRoadmapDraft(RoadmapDraft):
    nodes: list[NodeDraft] = Field(min_length=2, max_length=10)


class ResourceView(Schema):
    id: str
    node_id: str
    title: str
    url: str
    type: Literal["documentation", "youtube", "article", "interactive", "course"]
    provider: str
    language: str
    verified: bool


class NodeView(Schema):
    id: str
    map_id: str
    title: str
    summary: str
    type: NodeType
    status: NodeStatus
    skills: list[str]
    estimated_hours: float
    resource_query: str = ""
    prerequisites: list[str] = Field(default_factory=list)
    lesson: str = ""
    why_needed: str = ""
    learning_objectives: list[str] = Field(default_factory=list)
    subtopics: list[str] = Field(default_factory=list)
    practical_task: PracticalTask | None = None
    resources: list[ResourceView] = Field(default_factory=list)
    assessment_id: str | None = None
    child_map_id: str | None = None
    adaptive_map_id: str | None = None
    remediation_for_node_id: str | None = None
    task_completed: bool = False


class EdgeView(Schema):
    id: str
    source: str
    target: str
    kind: Literal["requires", "supports"]


class MapView(Schema):
    id: str
    project_id: str
    title: str
    description: str
    parent_map_id: str | None
    parent_node_id: str | None
    kind: Literal["root", "submap", "adaptive"] = "root"
    trigger: str | None = None
    target_node_id: str | None = None
    weak_skills: list[str] = Field(default_factory=list)
    generation_status: str
    version: int
    nodes: list[NodeView]
    edges: list[EdgeView]
    metadata: Metadata


class NodeUpdate(Schema):
    action: Literal["start", "complete_task"]
    expected_output: str | None = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def task_evidence(self):
        if self.action == "complete_task" and not (self.expected_output or "").strip():
            raise ValueError("Görev çıktısı gerekli.")
        return self
