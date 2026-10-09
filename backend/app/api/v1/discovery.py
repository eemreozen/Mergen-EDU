from fastapi import APIRouter

from app.api.dependencies import Db, Gateway, UserId
from app.schemas.discovery import DiscoveryAnswers, DiscoveryView
from app.services.discovery_service import discovery_view, save_answers
from app.services.project_service import owned_project

router = APIRouter()


@router.get("/projects/{project_id}/discovery", response_model=DiscoveryView)
async def get_discovery(project_id: str, db: Db, user: UserId):
    return discovery_view(await owned_project(db, project_id, user))


@router.post("/projects/{project_id}/discovery/answers", response_model=DiscoveryView)
async def submit_answers(project_id: str, body: DiscoveryAnswers, db: Db, user: UserId, ai: Gateway):
    return await save_answers(db, project_id, user, body, ai)
