from fastapi import APIRouter
from .auth import router as auth_router
from .applicants import router as applicants_router
from .applications import router as applications_router
from .evidence import router as evidence_router
from .mission_packs import router as mission_packs_router
from .portfolio import router as portfolio_router
from .rubric import router as rubric_router

api_router = APIRouter(prefix="/v1")
api_router.include_router(auth_router)
api_router.include_router(applicants_router)
# Nested routes first so /applications/{id}/portfolio is matched before /applications/{id}
api_router.include_router(portfolio_router)
api_router.include_router(evidence_router)
api_router.include_router(rubric_router)
api_router.include_router(applications_router)
api_router.include_router(mission_packs_router)
