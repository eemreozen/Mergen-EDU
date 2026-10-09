from app.ai.prompts.node_content import SYSTEM
from app.errors import AppError
from app.graph.progression import recalculate, require_access
from app.schemas.roadmap import NodeContent
from app.services.roadmap_service import map_view, owned_map, owned_node


async def get_node(db, node_id, user_id, gateway):
    node = await owned_node(db, node_id, user_id, lock=True)
    await require_access(db, node)
    if node.content is None:
        from app.services.project_service import ensure_ai_source, owned_project

        roadmap = await owned_map(db, node.map_id, user_id)
        ensure_ai_source(await owned_project(db, roadmap.project_id, user_id), gateway)
        from app.ai.context_builder import build_context

        content = await gateway.generate_structured(
            "node_content", SYSTEM, await build_context(db, user_id, node=node), NodeContent
        )
        node.content = content.model_dump()
        await db.flush()
    roadmap = await owned_map(db, node.map_id, user_id)
    return next(n for n in (await map_view(db, roadmap)).nodes if n.id == node.id)


async def update_node(db, node_id, user_id, body):
    node = await owned_node(db, node_id, user_id, lock=True)
    await require_access(db, node)
    if body.action == "start":
        if node.status == "available":
            node.status = "in_progress"
    else:
        if node.type != "development_task":
            raise AppError(
                "ASSESSMENT_REQUIRED", "Öğrenme düğümleri testle, alt haritalar çocuklarıyla tamamlanır.", 409
            )
        node.task_completed, node.task_evidence, node.status = True, body.expected_output, "completed"
    await recalculate(db, node.map_id)
    return await map_view(db, await owned_map(db, node.map_id, user_id))
