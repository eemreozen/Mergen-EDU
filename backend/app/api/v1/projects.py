from fastapi import APIRouter, Query
from sqlalchemy import select

from app.api.dependencies import Db, Gateway, UserId
from app.models.project import Project
from app.schemas.export import ExportBundle
from app.schemas.project import ProjectCreate, ProjectView
from app.services.export_service import export_project
from app.services.project_service import create_project, owned_project, project_view

router = APIRouter()


@router.post("/projects", response_model=ProjectView, status_code=201)
async def create(body: ProjectCreate, db: Db, user: UserId, ai: Gateway):
    return await create_project(db, user, body, ai)


@router.get("/projects", response_model=list[ProjectView])
async def list_projects(
    db: Db, user: UserId, limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0)
):
    rows = await db.scalars(
        select(Project)
        .where(Project.user_id == user)
        .order_by(Project.created_at)
        .limit(limit)
        .offset(offset)
    )
    return [project_view(p) for p in rows]


@router.get("/projects/{project_id}", response_model=ProjectView)
async def get_project(project_id: str, db: Db, user: UserId):
    return project_view(await owned_project(db, project_id, user))


@router.get("/projects/{project_id}/export", response_model=ExportBundle, response_model_exclude_none=False)
async def export(
    project_id: str, db: Db, user: UserId, mode: str = Query("public", pattern="^(public|demo)$")
):
    project = await owned_project(db, project_id, user)
    if mode == "demo":
        from app.errors import AppError

        if not project.is_demo:
            raise AppError(
                "DEMO_EXPORT_DISABLED",
                "Cevap anahtarı yalnızca demo fixture projelerinde dışa aktarılır.",
                403,
            )
    return await export_project(db, project, mode)
