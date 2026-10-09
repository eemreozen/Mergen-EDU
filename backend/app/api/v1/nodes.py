from fastapi import APIRouter

from app.api.dependencies import Db, Gateway, UserId
from app.graph.progression import require_access
from app.schemas.roadmap import MapView, NodeUpdate, NodeView, ResourceView
from app.services.node_service import get_node, update_node
from app.services.resource_service import node_resources
from app.services.roadmap_service import owned_node

router = APIRouter()


@router.get("/nodes/{node_id}", response_model=NodeView)
async def read_node(node_id: str, db: Db, user: UserId, ai: Gateway):
    return await get_node(db, node_id, user, ai)


@router.patch("/nodes/{node_id}", response_model=MapView)
async def progress(node_id: str, body: NodeUpdate, db: Db, user: UserId):
    return await update_node(db, node_id, user, body)


@router.get("/nodes/{node_id}/resources", response_model=list[ResourceView])
async def resources(node_id: str, db: Db, user: UserId):
    node = await owned_node(db, node_id, user)
    await require_access(db, node)
    return node_resources(node)
