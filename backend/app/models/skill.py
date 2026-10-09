from datetime import datetime

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, new_id


class UserSkill(Base):
    __tablename__ = "user_skills"
    __table_args__ = (UniqueConstraint("user_id", "skill_slug"),)
    id: Mapped[str] = mapped_column(primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    skill_slug: Mapped[str]
    knowledge_status: Mapped[str] = mapped_column(default="unknown")
    self_reported_level: Mapped[str | None]
    assessed_level: Mapped[float | None]
    last_assessed_at: Mapped[datetime | None]
