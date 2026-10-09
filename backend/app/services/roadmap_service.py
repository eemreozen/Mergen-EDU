from sqlalchemy import select

from app.ai.prompts.roadmap import SYSTEM
from app.db.base import new_id
from app.errors import AppError, not_found
from app.graph.validator import validate_graph
from app.models.project import Project
from app.models.roadmap import RoadmapEdge, RoadmapMap, RoadmapNode
from app.schemas.roadmap import EdgeView, MapView, NodeView, RootRoadmapDraft
from app.services.discovery_service import answer_fields, discovery_view
from app.services.project_service import owned_project, project_view
from app.services.skill_service import learner_profile


async def owned_map(db, map_id, user_id, lock=False):
    roadmap = await db.scalar(
        select(RoadmapMap).join(Project).where(RoadmapMap.id == map_id, Project.user_id == user_id)
    )
    if not roadmap:
        raise not_found()
    await owned_project(db, roadmap.project_id, user_id, lock=lock)
    if lock:
        await db.refresh(roadmap)
    return roadmap


async def owned_node(db, node_id, user_id, lock=False):
    node = await db.scalar(
        select(RoadmapNode)
        .join(RoadmapMap, RoadmapNode.map_id == RoadmapMap.id)
        .join(Project, RoadmapMap.project_id == Project.id)
        .where(RoadmapNode.id == node_id, Project.user_id == user_id)
    )
    if not node:
        raise not_found()
    if lock:
        await owned_map(db, node.map_id, user_id, lock=True)
        await db.refresh(node)
    return node


async def map_view(db, roadmap):
    from app.models.assessment import Assessment
    from app.services.resource_service import node_resources

    project = await db.get(Project, roadmap.project_id)
    nodes = list(
        await db.scalars(
            select(RoadmapNode)
            .where(RoadmapNode.map_id == roadmap.id)
            .order_by(RoadmapNode.created_at, RoadmapNode.id)
        )
    )
    edges = list(await db.scalars(select(RoadmapEdge).where(RoadmapEdge.map_id == roadmap.id)))
    assessments = list(
        await db.scalars(select(Assessment).where(Assessment.node_id.in_([n.id for n in nodes])))
    )
    adaptive_maps = list(
        await db.scalars(
            select(RoadmapMap).where(RoadmapMap.parent_map_id == roadmap.id, RoadmapMap.kind == "adaptive")
        )
    )
    adaptive_ids = {m.target_node_id: m.id for m in adaptive_maps}
    assessment_ids = {a.node_id: a.id for a in assessments}
    views = []
    for node in nodes:
        views.append(
            NodeView(
                id=node.id,
                map_id=node.map_id,
                title=node.title,
                summary=node.summary,
                type=node.type,
                status=node.status,
                skills=node.skills,
                estimated_hours=node.estimated_hours,
                prerequisites=[
                    e.source_node_id for e in edges if e.target_node_id == node.id and e.kind == "requires"
                ],
                **(node.content or {}),
                resources=node_resources(node),
                assessment_id=assessment_ids.get(node.id),
                child_map_id=node.child_map_id,
                adaptive_map_id=adaptive_ids.get(node.id),
                remediation_for_node_id=node.remediation_for_node_id,
                task_completed=node.task_completed,
            )
        )
    return MapView(
        id=roadmap.id,
        project_id=project.id,
        title=roadmap.title,
        description=roadmap.description,
        parent_map_id=roadmap.parent_map_id,
        parent_node_id=roadmap.parent_node_id,
        kind=roadmap.kind,
        trigger=roadmap.trigger,
        target_node_id=roadmap.target_node_id,
        weak_skills=roadmap.weak_skills,
        generation_status=roadmap.generation_status,
        version=roadmap.version,
        nodes=views,
        edges=[
            EdgeView(id=e.id, source=e.source_node_id, target=e.target_node_id, kind=e.kind) for e in edges
        ],
        metadata=project_view(project).metadata,
    )


async def persist_draft(db, project, draft, parent_map=None, parent_node=None):
    validate_graph(draft.nodes, draft.edges)
    if any(n.type == "remedial" for n in draft.nodes):
        raise AppError(
            "ROADMAP_VALIDATION_FAILED",
            "Telafi düğümleri yalnızca değerlendirme sonrası eklenebilir.",
            502,
            True,
        )
    if parent_map:
        depth = 1
        ancestor = parent_map
        while ancestor.parent_map_id:
            depth += 1
            ancestor = await db.get(RoadmapMap, ancestor.parent_map_id)
        if depth >= 2 and any(n.type == "submap" for n in draft.nodes):
            raise AppError(
                "ROADMAP_VALIDATION_FAILED", "En derin harita yeni alt harita içeremez.", 502, True
            )
    roadmap = RoadmapMap(
        id=new_id(),
        project_id=project.id,
        generation_key=parent_node.id if parent_node else "root",
        kind="submap" if parent_node else "root",
        parent_map_id=parent_map.id if parent_map else None,
        parent_node_id=parent_node.id if parent_node else None,
        title=draft.title,
        description=draft.description,
    )
    db.add(roadmap)
    await db.flush()
    ids = {n.key: new_id() for n in draft.nodes}
    required_targets = {e.target for e in draft.edges if e.kind == "requires"}
    for n in draft.nodes:
        db.add(
            RoadmapNode(
                id=ids[n.key],
                map_id=roadmap.id,
                **n.model_dump(),
                status="locked" if n.key in required_targets else "available",
            )
        )
    await db.flush()
    for e in draft.edges:
        db.add(
            RoadmapEdge(
                map_id=roadmap.id, source_node_id=ids[e.source], target_node_id=ids[e.target], kind=e.kind
            )
        )
    if parent_node:
        parent_node.child_map_id = roadmap.id
        parent_map.version += 1
    await db.flush()
    return roadmap


async def generate_root(db, project_id, user_id, gateway):
    project = await owned_project(db, project_id, user_id, lock=True)
    existing = await db.scalar(
        select(RoadmapMap).where(RoadmapMap.project_id == project.id, RoadmapMap.generation_key == "root")
    )
    if existing:
        return await map_view(db, existing)
    if not discovery_view(project).ready_for_roadmap:
        raise AppError("DISCOVERY_INCOMPLETE", "Önce gerekli keşif sorularını cevaplayın.", 409)
    from app.services.project_service import ensure_ai_source

    ensure_ai_source(project, gateway)
    project.status = "generating"
    draft = await gateway.generate_structured(
        "roadmap",
        SYSTEM,
        {
            "project": project.analysis,
            "locale": project.locale,
            "discovery": answer_fields(project),
            "learnerProfile": (await learner_profile(db, project)).model_dump(),
            "depth": 0,
        },
        RootRoadmapDraft,
    )
    roadmap = await persist_draft(db, project, draft)
    project.status = "active"
    return await map_view(db, roadmap)
