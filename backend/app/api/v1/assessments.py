from fastapi import APIRouter

from app.api.dependencies import Db, Gateway, UserId
from app.schemas.assessment import AssessmentResult, AssessmentSubmit, AssessmentView
from app.services.assessment_service import get_assessment, submit_assessment

router = APIRouter()


@router.get("/nodes/{node_id}/assessment", response_model=AssessmentView)
async def read_assessment(node_id: str, db: Db, user: UserId, ai: Gateway):
    return await get_assessment(db, node_id, user, ai)


@router.post("/nodes/{node_id}/assessment/submit", response_model=AssessmentResult)
async def submit(node_id: str, body: AssessmentSubmit, db: Db, user: UserId, ai: Gateway):
    return await submit_assessment(db, node_id, user, body, ai)
