from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, JsonType, new_id, utcnow


class MemoryReview(Base):
    __tablename__ = "memory_reviews"
    __table_args__ = (UniqueConstraint("source_node_id", "skill"),)
    id: Mapped[str] = mapped_column(primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), index=True)
    source_node_id: Mapped[str] = mapped_column(ForeignKey("roadmap_nodes.id"), index=True)
    skill: Mapped[str]
    level: Mapped[int] = mapped_column(default=0)
    status: Mapped[str] = mapped_column(default="scheduled")
    due_progress: Mapped[int]
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class MemoryCheck(Base):
    __tablename__ = "memory_checks"
    id: Mapped[str] = mapped_column(primary_key=True, default=new_id)
    review_id: Mapped[str] = mapped_column(ForeignKey("memory_reviews.id"), index=True)
    draft: Mapped[dict] = mapped_column(JsonType)
    submission_id: Mapped[str | None]
    selected_index: Mapped[int | None]
    result: Mapped[dict | None] = mapped_column(JsonType)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
