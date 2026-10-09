from pydantic import Field

from app.schemas.common import Metadata, Schema


class AdvisorRequest(Schema):
    project_id: str
    current_map_id: str | None = None
    current_node_id: str | None = None
    message: str = Field(min_length=1, max_length=4000)


class SuggestedAction(Schema):
    type: str
    label: str
    node_id: str | None = None


class AdvisorReply(Schema):
    reply: str = Field(min_length=1, max_length=12000)
    suggested_actions: list[SuggestedAction] = Field(default_factory=list, max_length=5)


class AdvisorView(AdvisorReply):
    metadata: Metadata
