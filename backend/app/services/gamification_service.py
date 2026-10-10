"""Rewards are derived from saved achievements; practice never enters this history."""

from sqlalchemy import select

from app.errors import AppError
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.memory import MemoryCheck, MemoryReview
from app.models.project import Project
from app.models.roadmap import RoadmapMap, RoadmapNode
from app.schemas.common import Schema


class LearnerProgress(Schema):
    total_points: int
    level: int
    correct_answers: int
    completed_steps: int
    practice_enabled: bool = False


def require_practice(settings):
    if not settings.demo_mode or settings.app_env == "production":
        raise AppError("PRACTICE_DISABLED", "Deneme erişimi yalnızca demo ortamında açık.", 403)


async def learner_progress(db, user_id, settings):
    rows = (
        await db.execute(
            select(AssessmentAttempt, Assessment)
            .join(Assessment, Assessment.id == AssessmentAttempt.assessment_id)
            .where(AssessmentAttempt.user_id == user_id)
        )
    ).all()
    correct = set()
    for attempt, assessment in rows:
        answers = {a["question_id"]: a["selected_index"] for a in attempt.answers}
        for question in assessment.questions:
            if answers.get(question["id"]) == question["correct_index"]:
                correct.add((assessment.id, question["id"]))
    completed = len(
        list(
            await db.scalars(
                select(RoadmapNode.id)
                .join(RoadmapMap, RoadmapMap.id == RoadmapNode.map_id)
                .join(Project, Project.id == RoadmapMap.project_id)
                .where(Project.user_id == user_id, RoadmapNode.status == "completed")
            )
        )
    )
    memory = list(
        await db.scalars(
            select(MemoryCheck)
            .join(MemoryReview, MemoryReview.id == MemoryCheck.review_id)
            .join(Project, Project.id == MemoryReview.project_id)
            .where(Project.user_id == user_id)
        )
    )
    recalled = sum(bool(check.result and check.result.get("correct")) for check in memory)
    points = (len(correct) + recalled) * 10 + completed * 25
    return LearnerProgress(
        total_points=points,
        level=points // 200 + 1,
        correct_answers=len(correct) + recalled,
        completed_steps=completed,
        practice_enabled=settings.demo_mode and settings.app_env != "production",
    )
