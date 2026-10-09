from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class Schema(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="forbid")


class Metadata(Schema):
    source: str = "openai"
    demo: bool = False


class ErrorDetail(Schema):
    code: str
    message: str
    retryable: bool


class ErrorResponse(Schema):
    error: ErrorDetail


class Health(Schema):
    status: str = "ok"
    ai_configured: bool
    demo_fixtures: bool
