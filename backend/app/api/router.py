from fastapi import APIRouter

from app.api.auth.login import router as auth_router
from app.api.superuser.dashboard import router as superuser_router
from app.api.tenants.create import router as tenants_router


def include_routers(app):
    """Include all API routers in the FastAPI app."""
    app.include_router(auth_router)
    app.include_router(superuser_router)
    app.include_router(tenants_router)
