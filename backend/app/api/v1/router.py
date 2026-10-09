from fastapi import APIRouter

from app.api.v1 import advisor, assessments, discovery, memory, nodes, projects, roadmaps
from app.schemas.common import ErrorResponse

router = APIRouter(
    prefix="/api/v1",
    responses={code: {"model": ErrorResponse} for code in [401, 403, 404, 409, 422, 500, 502, 503, 504]},
)
router.include_router(projects.router, tags=["Projeler ve dışa aktarım"])
router.include_router(discovery.router, tags=["Keşif"])

router.include_router(roadmaps.router, tags=["Haritalar"])

router.include_router(nodes.router, tags=["Öğrenme düğümleri"])
router.include_router(assessments.router, tags=["Değerlendirme"])
router.include_router(memory.router, tags=["Zaman Makinesi"])

router.include_router(advisor.router, tags=["AI danışman"])
