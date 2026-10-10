from fastapi import APIRouter, Request

from app.api.dependencies import Db, Gateway, UserId
from app.graph.progression import require_access
from app.schemas.resources import ReferenceView
from app.schemas.roadmap import MapView, NodeUpdate, NodeView, ResourceView
from app.services.node_service import get_node, update_node
from app.services.resource_service import node_resources
from app.services.roadmap_service import owned_node

router = APIRouter()


@router.get("/nodes/{node_id}", response_model=NodeView)
async def read_node(node_id: str, db: Db, user: UserId, ai: Gateway, practice: bool = False):
    return await get_node(db, node_id, user, ai, practice)


@router.patch("/nodes/{node_id}", response_model=MapView)
async def progress(node_id: str, body: NodeUpdate, db: Db, user: UserId):
    return await update_node(db, node_id, user, body)


@router.get("/nodes/{node_id}/resources", response_model=list[ResourceView])
async def resources(node_id: str, db: Db, user: UserId):
    node = await owned_node(db, node_id, user)
    await require_access(db, node)
    return node_resources(node)


@router.get("/nodes/{node_id}/references", response_model=ReferenceView)
async def references(node_id: str, request: Request, db: Db, user: UserId):
    from app.services.project_service import owned_project
    from app.services.roadmap_service import owned_map

    node = await owned_node(db, node_id, user)
    roadmap = await owned_map(db, node.map_id, user)
    project = await owned_project(db, roadmap.project_id, user)
    title, locale, fallback = node.title, project.locale, node_resources(node)
    skills, summary, query = tuple(node.skills), node.summary, node.resource_query
    # Release SQLite's write lock before making external requests.
    await db.commit()
    return await request.app.state.resource_search.for_topic(node_id, title, locale, fallback, skills=skills, summary=summary, resource_query=query)


@router.post("/nodes/{node_id}/learn", response_model=MapView)
async def learn(node_id: str, db: Db, user: UserId, ai: Gateway):
    from app.services.remediation_service import start_learning

    return await start_learning(db, node_id, user, ai)
