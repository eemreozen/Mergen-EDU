from uuid import UUID

from pydantic import Field, model_validator

from app.schemas.common import Schema
from app.schemas.roadmap import MapView


class AssessmentQuestion(Schema):
    id: str
    prompt: str = Field(min_length=1)
    options: list[str] = Field(min_length=2, max_length=6)
    correct_index: int = Field(ge=0)
    explanation: str
    target_skill: str
    difficulty: str

    @model_validator(mode="after")
    def option_index(self):
        if self.correct_index >= len(self.options) or len(set(self.options)) != len(self.options):
            raise ValueError("Geçersiz seçenekler veya cevap indeksi.")
        return self


class AssessmentDraft(Schema):
    title: str
    questions: list[AssessmentQuestion] = Field(min_length=3, max_length=10)

    @model_validator(mode="after")
    def unique_questions(self):
        if len({q.id for q in self.questions}) != len(self.questions):
            raise ValueError("Soru kimlikleri benzersiz olmalı.")
        return self


class PublicQuestion(Schema):
    id: str
    prompt: str
    options: list[str]
    explanation: str = ""
    target_skill: str
    difficulty: str


class AssessmentView(Schema):
    id: str
    node_id: str
    title: str
    passing_score: float
    version: int
    questions: list[PublicQuestion]


class DemoAssessmentView(AssessmentView):
    questions: list[AssessmentQuestion]


class AnswerSubmission(Schema):
    question_id: str
    selected_index: int = Field(ge=0, strict=True)


class AssessmentSubmit(Schema):
    assessment_id: str
    version: int = Field(ge=1)
    submission_id: UUID
    answers: list[AnswerSubmission] = Field(min_length=1, max_length=10)


class AssessmentResult(Schema):
    attempt_id: str
    passed: bool
    score: float
    weak_skills: list[str]
    remediation_created: bool
    adaptive_map: MapView | None = None
    memory_review_ids: list[str] = Field(default_factory=list)
    map: MapView
