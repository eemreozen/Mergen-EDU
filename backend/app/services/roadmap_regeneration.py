"""Regenerate through the production planner, keeping the previous project intact."""
from copy import deepcopy

from sqlalchemy import select, text, update

from app.ai.prompts.roadmap import SYSTEM
from app.db.base import utcnow
from app.errors import AppError
from app.graph.validator import validate_graph
from app.models.advisor import AdvisorMessage
from app.models.memory import MemoryReview
from app.models.project import Project
from app.models.roadmap import RoadmapMap, RoadmapNode
from app.schemas.roadmap import RootRoadmapDraft
from app.services.discovery_service import answer_fields, discovery_view
from app.services.export_service import export_project
from app.services.project_service import ensure_ai_source, owned_project
from app.services.roadmap_service import persist_draft
from app.services.skill_service import learner_profile


async def fingerprint(db, project_id):
    maps = list(await db.execute(select(RoadmapMap.id, RoadmapMap.version).where(RoadmapMap.project_id == project_id)))
    nodes = list(await db.execute(select(RoadmapNode.id, RoadmapNode.status, RoadmapNode.child_map_id, RoadmapNode.content).join(RoadmapMap, RoadmapNode.map_id == RoadmapMap.id).where(RoadmapMap.project_id == project_id)))
    return sorted(map(tuple, maps)), sorted(map(tuple, nodes), key=lambda row: row[0])


async def regenerate_root(db, project_id, user_id, gateway):
    project = await owned_project(db, project_id, user_id)
    if not discovery_view(project).ready_for_roadmap:
        raise AppError("DISCOVERY_INCOMPLETE", "Keşif cevapları tamamlanmalı.", 409)
    ensure_ai_source(project, gateway)
    before = await fingerprint(db, project_id)
    if not before[0]:
        raise AppError("ROADMAP_REQUIRED", "Önce mevcut bir harita gerekli.", 409)
    revision_time = project.updated_at
    payload = {
        "project": deepcopy(project.analysis), "originalIdea": project.original_idea,
        "locale": project.locale, "discovery": answer_fields(project),
        "learnerProfile": (await learner_profile(db, project)).model_dump(), "depth": 0,
    }
    # Never hold a database write lock while waiting for Gemini.
    await db.commit()
    draft = await gateway.generate_structured("roadmap", SYSTEM, payload, RootRoadmapDraft)
    validate_graph(draft.nodes, draft.edges, require_connected=True)
    if not gateway.is_demo and any(not n.resource_query.strip() for n in draft.nodes):
        raise AppError("ROADMAP_VALIDATION_FAILED", "Kaynak arama ifadeleri eksik.", 502, True)
    if db.bind.dialect.name == "sqlite":
        await db.execute(text("BEGIN IMMEDIATE"))
    project = await owned_project(db, project_id, user_id, lock=True)
    if project.updated_at != revision_time or await fingerprint(db, project_id) != before:
        raise AppError("PROJECT_CHANGED", "Proje üretim sırasında değişti; mevcut sürüm korundu.", 409)
    archive = Project(
        user_id=user_id, title=f"{project.title} (Önceki sürüm)",
        original_idea=project.original_idea, primary_domain=project.primary_domain,
        secondary_domains=deepcopy(project.secondary_domains), status=project.status,
        locale=project.locale, analysis=deepcopy(project.analysis), is_demo=project.is_demo,
        discovery_data={**deepcopy(project.discovery_data), "archivedRevisionOf": project.id,
                        "archivedAt": utcnow().isoformat()},
    )
    db.add(archive)
    await db.flush()
    for model in (RoadmapMap, MemoryReview, AdvisorMessage):
        await db.execute(update(model).where(model.project_id == project_id).values(project_id=archive.id))
    await persist_draft(db, project, draft)
    project.status = "active"
    project.updated_at = utcnow()
    await db.flush()
    # Validate the resulting active and historical bundles before the atomic commit.
    await export_project(db, project)
    await export_project(db, archive)
    return archive.id, len(draft.nodes)
