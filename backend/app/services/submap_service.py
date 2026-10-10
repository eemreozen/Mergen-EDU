from app.ai.prompts.submap import SYSTEM
from app.errors import AppError
from app.models.roadmap import RoadmapMap
from app.schemas.roadmap import RoadmapDraft
from app.services.branch_scope import branch_scope, validate_submap_scope
from app.services.discovery_service import answer_fields
from app.services.project_service import owned_project
from app.services.roadmap_service import map_view, owned_map, owned_node, persist_draft
from app.services.skill_service import learner_profile
from app.services.topic_expansion import broad_topic, expand_topic


async def generate_submap(db, node_id, user_id, gateway):
    node = await owned_node(db, node_id, user_id, lock=True)
    if node.child_map_id:
        return await map_view(db, await db.get(RoadmapMap, node.child_map_id))
    topic = broad_topic(node)
    if node.type != "submap" and not topic:
        raise AppError("NOT_SUBMAP_NODE", "Bu düğüm alt harita türünde değil.", 409)
    from app.graph.progression import require_access

    await require_access(db, node)
    if node.status == "locked":
        raise AppError("NODE_LOCKED", "Ön koşullar tamamlanmalı.", 409)
    parent = await owned_map(db, node.map_id, user_id)
    depth, ancestor = 1, parent
    while ancestor.parent_map_id:
        depth += 1
        ancestor = await db.get(RoadmapMap, ancestor.parent_map_id)
    if depth > 2:
        raise AppError("SUBMAP_DEPTH_LIMIT", "En fazla iki alt seviye destekleniyor.", 409)
    project = await owned_project(db, parent.project_id, user_id)
    from app.services.project_service import ensure_ai_source

    ensure_ai_source(project, gateway)
    scope = await branch_scope(db, parent, node)
    if topic:
        draft = expand_topic(topic, project, answer_fields(project))
        validate_submap_scope(draft, scope)
        node.type = "submap"
        return await map_view(db, await persist_draft(db, project, draft, parent, node))
    draft = await gateway.generate_structured(
        "submap",
        SYSTEM,
        {
            "project": project.analysis,
            "originalIdea": project.original_idea,
            "locale": project.locale,
            "node": {"title": node.title, "summary": node.summary, "skills": node.skills},
            "branchScope": scope,
            "discovery": answer_fields(project),
            "learnerProfile": (await learner_profile(db, project)).model_dump(),
            "depth": depth,
        },
        RoadmapDraft,
    )
    validate_submap_scope(draft, scope)
    return await map_view(db, await persist_draft(db, project, draft, parent, node))
