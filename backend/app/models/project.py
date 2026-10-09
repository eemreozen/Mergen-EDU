from datetime import datetime

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, JsonType, new_id, utcnow


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    locale: Mapped[str] = mapped_column(default="tr")
    created_at: Mapped[datetime] = mapped_column(default=utcnow)


class Project(Base):
    __tablename__ = "projects"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str]
    original_idea: Mapped[str]
    primary_domain: Mapped[str]
    secondary_domains: Mapped[list] = mapped_column(JsonType, default=list)
    status: Mapped[str] = mapped_column(default="discovery")
    locale: Mapped[str] = mapped_column(default="tr")
    analysis: Mapped[dict] = mapped_column(JsonType)
    discovery_data: Mapped[dict] = mapped_column(JsonType, default=dict)
    is_demo: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow)
