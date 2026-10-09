from datetime import datetime

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, JsonType, new_id, utcnow


class Assessment(Base):
    __tablename__ = "assessments"
    __table_args__ = (UniqueConstraint("node_id"),)
    id: Mapped[str] = mapped_column(primary_key=True, default=new_id)
    node_id: Mapped[str] = mapped_column(ForeignKey("roadmap_nodes.id"), index=True)
    title: Mapped[str]
    passing_score: Mapped[float] = mapped_column(default=70)
    questions: Mapped[list] = mapped_column(JsonType)
    version: Mapped[int] = mapped_column(default=1)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"
    __table_args__ = (UniqueConstraint("assessment_id", "user_id", "submission_id"),)
    id: Mapped[str] = mapped_column(primary_key=True, default=new_id)
    assessment_id: Mapped[str] = mapped_column(ForeignKey("assessments.id"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    submission_id: Mapped[str]
    answers: Mapped[list] = mapped_column(JsonType)
    score: Mapped[float]
    passed: Mapped[bool]
    weak_skills: Mapped[list] = mapped_column(JsonType)
    result: Mapped[dict] = mapped_column(JsonType)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)
