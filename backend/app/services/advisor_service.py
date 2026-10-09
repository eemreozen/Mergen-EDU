from app.ai.context_builder import build_context
from app.ai.prompts.advisor import SYSTEM
from app.errors import AppError
from app.models.advisor import AdvisorMessage
from app.schemas.advisor import AdvisorReply, AdvisorView
from app.services.project_service import owned_project, project_view
from app.services.roadmap_service import owned_map, owned_node


async def chat(db, user_id, body, gateway):
    project = await owned_project(db, body.project_id, user_id)
    roadmap = await owned_map(db, body.current_map_id, user_id) if body.current_map_id else None
    node = await owned_node(db, body.current_node_id, user_id) if body.current_node_id else None
    if roadmap and roadmap.project_id != project.id:
        raise AppError("CONTEXT_MISMATCH", "Harita seçili projeye ait değil.", 422)
    if node:
        actual_map = await owned_map(db, node.map_id, user_id)
        if actual_map.project_id != project.id or (roadmap and node.map_id != roadmap.id):
            raise AppError("CONTEXT_MISMATCH", "Düğüm seçili harita/projeye ait değil.", 422)
    from app.services.project_service import ensure_ai_source

    ensure_ai_source(project, gateway)
    context = await build_context(db, user_id, project=project, roadmap=roadmap, node=node)
    context["message"] = body.message
    reply = await gateway.generate_structured("advisor", SYSTEM, context, AdvisorReply)
    db.add_all(
        [
            AdvisorMessage(project_id=project.id, role="user", message=body.message),
            AdvisorMessage(project_id=project.id, role="assistant", message=reply.reply),
        ]
    )
    await db.flush()
    return AdvisorView(**reply.model_dump(), metadata=project_view(project).metadata)
