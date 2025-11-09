"""Backend routes package: expose routers for inclusion in FastAPI app."""
from fastapi import APIRouter

from .plan_routes import router as plan_router
from .csv_routes import router as csv_router

router = APIRouter()
router.include_router(plan_router, prefix="/api")
router.include_router(csv_router, prefix="/api")

__all__ = ["router", "plan_router", "csv_router"]
