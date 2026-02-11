from fastapi import APIRouter
from .auth import router as auth_router
from .applicants import router as applicants_router
from .applications import router as applications_router
from .evidence import router as evidence_router
from .mission_packs import router as mission_packs_router
from .portfolio import router as portfolio_router
from .rubric import router as rubric_router
from .cv import router as cv_router
from .chat import router as chat_router
from .ingest import router as ingest_router
from .saturn import router as saturn_router

api_router = APIRouter(prefix="/v1")
api_router.include_router(auth_router)
api_router.include_router(applicants_router)
# Nested routes first so /applications/{id}/... is matched before /applications/{id}
api_router.include_router(portfolio_router)
api_router.include_router(evidence_router)
api_router.include_router(rubric_router)
api_router.include_router(cv_router)
api_router.include_router(applications_router)
api_router.include_router(mission_packs_router)
api_router.include_router(chat_router)
api_router.include_router(ingest_router)
api_router.include_router(saturn_router)