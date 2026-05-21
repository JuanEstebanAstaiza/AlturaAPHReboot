from fastapi import APIRouter as FastAPIRouter

from app.api.auth.login import router as auth_router
from app.api.superuser.dashboard import router as superuser_router
from app.api.tenants.create import router as tenants_router
from app.api.residents.directory import router as residents_dir_router
from app.api.residents.linking import router as residents_link_router
from app.api.units.towers import router as units_towers_router
from app.api.units.listings import router as units_listings_router
from app.api.pqrs.tickets import router as pqrs_router
from app.api.superuser.plans import router as plans_router
from app.api.superuser.admin_create import router as admin_create_router


def include_routers(app):
    """Include all API routers in the FastAPI app."""
    app.include_router(auth_router)
    app.include_router(superuser_router)
    app.include_router(tenants_router)
    app.include_router(residents_dir_router)
    app.include_router(residents_link_router)
    app.include_router(units_towers_router)
    app.include_router(units_listings_router)
    app.include_router(pqrs_router)
    app.include_router(plans_router)
    app.include_router(admin_create_router)
