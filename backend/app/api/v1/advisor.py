from fastapi import APIRouter

from app.api.dependencies import Db, Gateway, UserId
from app.schemas.advisor import AdvisorRequest, AdvisorView
from app.services.advisor_service import chat

router = APIRouter()


@router.post("/advisor/chat", response_model=AdvisorView)
async def advisor(body: AdvisorRequest, db: Db, user: UserId, ai: Gateway):
    return await chat(db, user, body, ai)
