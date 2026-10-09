from sqlalchemy import select

from app.ai.prompts.project_analysis import SYSTEM
from app.errors import not_found
from app.models.project import Project
from app.schemas.common import Metadata
from app.schemas.discovery import DiscoveryQuestion
from app.schemas.project import ProjectAnalysis, ProjectView
from app.templates.registry import select_questions


async def owned_project(db, project_id, user_id, lock=False):
    query = select(Project).where(Project.id == project_id, Project.user_id == user_id)
    if lock:
        query = query.with_for_update()
    project = await db.scalar(query.execution_options(populate_existing=True))
    if not project:
        raise not_found()
    return project


def project_view(project):
    return ProjectView(
        id=project.id,
        project_id=project.id,
        title=project.title,
        original_idea=project.original_idea,
        primary_domain=project.primary_domain,
        secondary_domains=project.secondary_domains,
        goal=project.analysis["goal"],
        locale=project.locale,
        status=project.status,
        metadata=Metadata(
            source="deterministic_fixture"
            if project.is_demo
            else project.discovery_data.get("aiProvider", "openai"),
            demo=project.is_demo,
        ),
    )


async def create_project(db, user_id, request, gateway):
    analysis = await gateway.generate_structured(
        "project_analysis", SYSTEM, request.model_dump(), ProjectAnalysis
    )
    questions = select_questions(analysis.primary_domain, analysis.secondary_domains, request.locale)
    used_fields = {q.target_field for q in questions}
    if len(analysis.discovery_questions) < 3:
        from app.errors import AppError

        raise AppError(
            "AI_INVALID_OUTPUT", "Proje için yeterli ayrıntılı keşif sorusu üretilemedi.", 502, True
        )
    for index, question in enumerate(analysis.discovery_questions):
        if question.target_field in used_fields or (
            question.type != "short_text" and len(set(question.options)) < 2
        ):
            from app.errors import AppError

            raise AppError("AI_INVALID_OUTPUT", "Proje keşif soruları tutarsız.", 502, True)
        identifier = f"project-detail-{index}"
        questions.append(DiscoveryQuestion(id=identifier, question_id=identifier, **question.model_dump()))
        used_fields.add(question.target_field)
    project = Project(
        user_id=user_id,
        title=analysis.title,
        original_idea=request.idea,
        locale=request.locale,
        primary_domain=analysis.primary_domain,
        secondary_domains=analysis.secondary_domains,
        analysis=analysis.model_dump(),
        is_demo=gateway.is_demo,
        discovery_data={
            "questions": [q.model_dump() for q in questions],
            "answers": [],
            "followupsGenerated": False,
            "aiProvider": gateway.settings.llm_provider,
        },
    )
    db.add(project)
    await db.flush()
    return project_view(project)


def ensure_ai_source(project, gateway):
    if project.is_demo != gateway.is_demo:
        from app.errors import AppError

        raise AppError(
            "AI_MODE_MISMATCH",
            "Bu proje farklı AI modunda oluşturuldu. Aynı modda açın veya yeni proje oluşturun.",
            409,
        )
