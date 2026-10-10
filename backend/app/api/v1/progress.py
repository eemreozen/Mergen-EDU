from fastapi import APIRouter, Request

from app.api.dependencies import Db, UserId
from app.services.gamification_service import LearnerProgress, learner_progress

router = APIRouter()


@router.get("/me/progress", response_model=LearnerProgress)
async def progress(db: Db, user: UserId, request: Request):
    return await learner_progress(db, user, request.app.state.settings)
