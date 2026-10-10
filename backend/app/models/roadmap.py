from datetime import datetime

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, JsonType, new_id, utcnow


class RoadmapMap(Base):
    __tablename__ = "roadmap_maps"
    __table_args__ = (UniqueConstraint("project_id", "generation_key"), UniqueConstraint("parent_node_id"))
    id: Mapped[str] = mapped_column(primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), index=True)
    generation_key: Mapped[str]
    kind: Mapped[str] = mapped_column(default="root", server_default="root")
    trigger: Mapped[str | None]
    target_node_id: Mapped[str | None] = mapped_column(
        ForeignKey("roadmap_nodes.id", use_alter=True, name="fk_map_target_node"), index=True
    )
    weak_skills: Mapped[list] = mapped_column(JsonType, default=list, server_default="[]")
    parent_map_id: Mapped[str | None] = mapped_column(ForeignKey("roadmap_maps.id"))
    parent_node_id: Mapped[str | None] = mapped_column(
        ForeignKey("roadmap_nodes.id", use_alter=True, name="fk_map_parent_node")
    )
    title: Mapped[str]
    description: Mapped[str]
    generation_status: Mapped[str] = mapped_column(default="ready")
    version: Mapped[int] = mapped_column(default=1)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)


class RoadmapNode(Base):
    __tablename__ = "roadmap_nodes"
    __table_args__ = (UniqueConstraint("map_id", "key"),)
    id: Mapped[str] = mapped_column(primary_key=True, default=new_id)
    map_id: Mapped[str] = mapped_column(ForeignKey("roadmap_maps.id"), index=True)
    key: Mapped[str]
    type: Mapped[str]
    title: Mapped[str]
    resource_query: Mapped[str] = mapped_column(default="", server_default="")
    summary: Mapped[str]
    status: Mapped[str] = mapped_column(default="locked")
    skills: Mapped[list] = mapped_column(JsonType)
    content: Mapped[dict | None] = mapped_column(JsonType)
    child_map_id: Mapped[str | None] = mapped_column(
        ForeignKey("roadmap_maps.id", use_alter=True, name="fk_node_child_map")
    )
    estimated_hours: Mapped[float]
    remediation_for_node_id: Mapped[str | None] = mapped_column(ForeignKey("roadmap_nodes.id"))
    task_completed: Mapped[bool] = mapped_column(default=False)
    task_evidence: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(default=utcnow)


class RoadmapEdge(Base):
    __tablename__ = "roadmap_edges"
    __table_args__ = (UniqueConstraint("map_id", "source_node_id", "target_node_id", "kind"),)
    id: Mapped[str] = mapped_column(primary_key=True, default=new_id)
    map_id: Mapped[str] = mapped_column(ForeignKey("roadmap_maps.id"), index=True)
    source_node_id: Mapped[str] = mapped_column(ForeignKey("roadmap_nodes.id"))
    target_node_id: Mapped[str] = mapped_column(ForeignKey("roadmap_nodes.id"))
    kind: Mapped[str]
