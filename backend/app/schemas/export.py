from typing import Literal

from pydantic import Field

from app.schemas.assessment import AssessmentView, DemoAssessmentView
from app.schemas.common import Metadata, Schema
from app.schemas.discovery import DiscoveryView
from app.schemas.project import LearnerProfile, ProjectView
from app.schemas.roadmap import MapView, ResourceView


class ExportBundle(Schema):
    schema_version: Literal["mergen/v1"] = "mergen/v1"
    project: ProjectView
    learner_profile: LearnerProfile
    discovery: DiscoveryView
    maps: list[MapView] = Field(default_factory=list)
    assessments: list[AssessmentView | DemoAssessmentView] = Field(default_factory=list)
    resources: list[ResourceView] = Field(default_factory=list)
    metadata: Metadata
