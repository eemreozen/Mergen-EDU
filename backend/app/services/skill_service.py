from sqlalchemy import select

from app.db.base import utcnow
from app.models.skill import UserSkill
from app.schemas.project import LearnerProfile
from app.services.discovery_service import answer_fields


async def save_self_reported(db, user_id, fields):
    technologies = fields.get("knownTechnologies", "")
    if isinstance(technologies, str):
        technologies = [s.strip().lower() for s in technologies.split(",") if s.strip()]
    for technology in technologies:
        slug = f"{technology}.basics"
        skill = await db.scalar(
            select(UserSkill).where(UserSkill.user_id == user_id, UserSkill.skill_slug == slug)
        )
        if not skill:
            db.add(
                UserSkill(
                    user_id=user_id,
                    skill_slug=slug,
                    knowledge_status="self_reported",
                    self_reported_level=fields.get("experienceLevel", "unknown"),
                )
            )


async def update_assessed(db, user_id, tested_skills, weak_skills, score):
    for slug in set(tested_skills):
        skill = await db.scalar(
            select(UserSkill).where(UserSkill.user_id == user_id, UserSkill.skill_slug == slug)
        )
        if not skill:
            skill = UserSkill(user_id=user_id, skill_slug=slug)
            db.add(skill)
        skill.knowledge_status = "needs_review" if slug in weak_skills else "verified"
        skill.assessed_level = score
        skill.last_assessed_at = utcnow()


async def learner_profile(db, project):
    fields = answer_fields(project)
    skills = list(await db.scalars(select(UserSkill).where(UserSkill.user_id == project.user_id)))
    technologies = fields.get("knownTechnologies", "")
    if isinstance(technologies, str):
        technologies = [s.strip() for s in technologies.split(",") if s.strip()]
    return LearnerProfile(
        experience_level=fields.get("experienceLevel", "unknown"),
        known_technologies=technologies,
        weekly_hours=float(fields["weeklyHours"]) if fields.get("weeklyHours") else None,
        self_reported_skills=[s.skill_slug for s in skills if s.self_reported_level is not None],
        verified_skills=[s.skill_slug for s in skills if s.knowledge_status == "verified"],
    )
