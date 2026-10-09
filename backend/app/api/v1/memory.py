from fastapi import APIRouter

from app.api.dependencies import Db, Gateway, UserId
from app.schemas.memory import MemoryChallenge, MemoryResult, MemorySubmit, TimeMachineView
from app.services.memory_service import prepare_review, submit_review, time_machine

router = APIRouter()


@router.get("/projects/{project_id}/time-machine", response_model=TimeMachineView)
async def read_memory(project_id: str, db: Db, user: UserId):
    return await time_machine(db, project_id, user)


@router.post("/memory/{review_id}/prepare", response_model=MemoryChallenge)
async def prepare(review_id: str, db: Db, user: UserId, ai: Gateway):
    return await prepare_review(db, review_id, user, ai)


@router.post("/memory/{review_id}/answer", response_model=MemoryResult)
async def answer(review_id: str, body: MemorySubmit, db: Db, user: UserId):
    return await submit_review(db, review_id, user, body)
