from typing import Literal

from pydantic import Field

from app.schemas.common import Schema


class DiscoveryQuestion(Schema):
    id: str
    question_id: str
    text: str
    type: Literal["single_choice", "multi_choice", "short_text"]
    options: list[str] = Field(default_factory=list)
    target_field: str
    required: bool = True
    parent_question_id: str | None = None
    completed: bool = False


class DiscoveryAnswer(Schema):
    question_id: str
    value: str | list[str]


class DiscoveryAnswers(Schema):
    answers: list[DiscoveryAnswer] = Field(min_length=1, max_length=30)


class DiscoveryView(Schema):
    questions: list[DiscoveryQuestion]
    answers: list[DiscoveryAnswer]
    completed: bool
    next_question: DiscoveryQuestion | None
    ready_for_roadmap: bool


class FollowupQuestion(Schema):
    text: str
    target_field: str
    parent_question_id: str


class FollowupPlan(Schema):
    questions: list[FollowupQuestion] = Field(max_length=2)


class ProjectDiscoveryQuestion(Schema):
    text: str = Field(min_length=10, max_length=400)
    type: Literal["single_choice", "multi_choice", "short_text"]
    options: list[str] = Field(default_factory=list, max_length=8)
    target_field: str = Field(pattern=r"^[a-zA-Z][a-zA-Z0-9_]{1,60}$")
