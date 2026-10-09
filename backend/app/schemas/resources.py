from typing import Literal

from app.schemas.common import Schema
from app.schemas.roadmap import ResourceView


class ReferenceView(Schema):
    resources: list[ResourceView]
    status: Literal["complete", "partial", "unavailable"]
