from typing import Literal

from pydantic import Field

from app.schemas.common import Metadata, Schema
from app.schemas.discovery import ProjectDiscoveryQuestion

Domain = Literal["core", "web", "mobile", "ai_ml", "game_dev"]
ProjectStatus = Literal["discovery", "ready_for_roadmap", "generating", "active", "failed"]


class ProjectCreate(Schema):
    idea: str = Field(min_length=10, max_length=5000)
    locale: Literal["tr", "en"] = "tr"


class ProjectAnalysis(Schema):
    title: str = Field(min_length=1, max_length=200)
    goal: str = Field(min_length=1, max_length=2000)
    primary_domain: Domain
    secondary_domains: list[Domain] = Field(max_length=4)
    project_type: str
    required_skills: list[str]
    uncertain_decisions: list[str]
    discovery_questions: list[ProjectDiscoveryQuestion] = Field(default_factory=list, max_length=2)
    mvp_suggestions: list[str]


class ProjectView(Schema):
    id: str
    project_id: str
    title: str
    original_idea: str
    primary_domain: Domain
    secondary_domains: list[Domain]
    goal: str
    locale: str
    status: ProjectStatus
    metadata: Metadata


class LearnerProfile(Schema):
    experience_level: str = "unknown"
    known_technologies: list[str] = Field(default_factory=list)
    self_reported_skills: list[str] = Field(default_factory=list)
    verified_skills: list[str] = Field(default_factory=list)
    weekly_hours: float | None = None


class SkillView(Schema):
    skill: str
    status: Literal["unknown", "self_reported", "assessed", "verified", "needs_review"]
    self_reported_level: str | None = None
    assessed_level: float | None = None
