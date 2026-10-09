from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.assessment import AssessmentQuestion
from app.schemas.common import Schema


class MemoryDraft(Schema):
    question: AssessmentQuestion
    refresher: str = Field(min_length=50, max_length=1600)
    mini_exercise: str = Field(min_length=10, max_length=500)


class MemoryReviewView(Schema):
    id: str
    source_node_id: str
    source_title: str
    skill: str
    level: int
    status: Literal["scheduled", "refresher"]
    due: bool
    due_at: datetime
    remaining_steps: int


class WrongQuestionView(Schema):
    question_id: str
    node_id: str
    node_title: str
    prompt: str
    selected_option: str
    correct_option: str
    explanation: str
    skill: str
    wrong_count: int
    last_wrong_at: datetime
    review_id: str | None = None


class TimeMachineView(Schema):
    completed_steps: int
    due_count: int
    reviews: list[MemoryReviewView]
    wrong_questions: list[WrongQuestionView]


class MemoryChallenge(Schema):
    id: str
    review_id: str
    source_title: str
    skill: str
    prompt: str
    options: list[str]


class MemorySubmit(Schema):
    check_id: str
    submission_id: UUID
    selected_index: int = Field(ge=0, strict=True)


class MemoryResult(Schema):
    check_id: str
    correct: bool
    correct_index: int
    explanation: str
    refresher: str
    mini_exercise: str
    next_due_at: datetime
    remaining_steps: int
