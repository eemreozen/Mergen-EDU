from fastapi import APIRouter
from sqlalchemy import select

from app.api.dependencies import Db, Gateway, UserId
from app.errors import not_found
from app.models.roadmap import RoadmapMap
from app.schemas.roadmap import MapView
from app.services.project_service import owned_project
from app.services.roadmap_service import generate_root, map_view, owned_map
from app.services.submap_service import generate_submap

router = APIRouter()


@router.post("/projects/{project_id}/roadmap/generate", response_model=MapView)
async def generate(project_id: str, db: Db, user: UserId, ai: Gateway):
    from app.errors import AppError

    try:
        return await generate_root(db, project_id, user, ai)
    except AppError as exc:
        if exc.code.startswith("AI_") or exc.code == "ROADMAP_VALIDATION_FAILED":
            await db.rollback()
            if db.bind.dialect.name == "sqlite":
                from sqlalchemy import text

                await db.execute(text("BEGIN IMMEDIATE"))
            project = await owned_project(db, project_id, user, lock=True)
            existing = await db.scalar(
                select(RoadmapMap).where(
                    RoadmapMap.project_id == project_id, RoadmapMap.generation_key == "root"
                )
            )
            if not existing:
                project.status = "failed"
            await db.commit()
        raise


@router.get("/projects/{project_id}/roadmap", response_model=MapView)
async def get_root(project_id: str, db: Db, user: UserId):
    await owned_project(db, project_id, user)
    root = await db.scalar(
        select(RoadmapMap).where(RoadmapMap.project_id == project_id, RoadmapMap.generation_key == "root")
    )
    if not root:
        raise not_found()
    return await map_view(db, root)


@router.get("/maps/{map_id}", response_model=MapView)
async def get_map(map_id: str, db: Db, user: UserId):
    return await map_view(db, await owned_map(db, map_id, user))


@router.post("/nodes/{node_id}/submap", response_model=MapView)
async def submap(node_id: str, db: Db, user: UserId, ai: Gateway):
    return await generate_submap(db, node_id, user, ai)
