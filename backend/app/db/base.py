from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def new_id():
    return str(uuid4())


def utcnow():
    return datetime.now(UTC)


JsonType = JSON().with_variant(JSONB(), "postgresql")
