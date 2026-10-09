from datetime import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, new_id, utcnow


class AdvisorMessage(Base):
    __tablename__ = "advisor_messages"
    id: Mapped[str] = mapped_column(primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), index=True)
    role: Mapped[str]
    message: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(default=utcnow)
