from sqlalchemy import select

from app.errors import AppError
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.roadmap import RoadmapNode
from app.models.skill import UserSkill
from app.services.project_service import owned_project
from app.services.roadmap_service import owned_map, owned_node


async def build_context(db, user_id, project=None, roadmap=None, node=None):
    if node:
        node = await owned_node(db, node.id, user_id)
        roadmap = await owned_map(db, node.map_id, user_id)
    if roadmap:
        roadmap = await owned_map(db, roadmap.id, user_id)
        if project and roadmap.project_id != project.id:
            raise AppError("CONTEXT_MISMATCH", "Harita seçili projeye ait değil.", 422)
        project = await owned_project(db, roadmap.project_id, user_id)
    if not project:
        raise AppError("CONTEXT_REQUIRED", "Proje bağlamı gerekli.", 422)
    project = await owned_project(db, project.id, user_id)
    context = {
        "project": {"id": project.id, "goal": project.analysis["goal"], "title": project.title},
        "locale": project.locale,
    }
    if roadmap:
        context["map"] = {"id": roadmap.id, "title": roadmap.title}
    skills = node.skills if node else project.analysis.get("required_skills", [])
    relevant = list(
        await db.scalars(
            select(UserSkill).where(UserSkill.user_id == user_id, UserSkill.skill_slug.in_(skills))
        )
    )
    context["skills"] = [
        {
            "skill": s.skill_slug,
            "status": s.knowledge_status,
            "selfReportedLevel": s.self_reported_level,
            "assessedLevel": s.assessed_level,
        }
        for s in relevant
    ]
    if node:
        context["node"] = {
            "id": node.id,
            "title": node.title,
            "summary": node.summary,
            "skills": node.skills,
            "status": node.status,
            "type": node.type,
            "content": node.content,
        }
        target = (
            roadmap.target_node_id if roadmap.kind == "adaptive" else node.remediation_for_node_id or node.id
        )
        attempt = await db.scalar(
            select(AssessmentAttempt)
            .join(Assessment)
            .where(Assessment.node_id == target, AssessmentAttempt.user_id == user_id)
            .order_by(AssessmentAttempt.created_at.desc())
            .limit(1)
        )
        if attempt:
            context["lastAssessment"] = {
                "score": attempt.score,
                "passed": attempt.passed,
                "weakSkills": attempt.weak_skills,
            }
        if node.remediation_for_node_id or roadmap.kind == "adaptive":
            original = await db.get(RoadmapNode, roadmap.target_node_id or node.remediation_for_node_id)
            context["remediationReason"] = {
                "originalNodeId": original.id,
                "originalTitle": original.title,
                "weakSkills": node.skills,
            }
    return context
