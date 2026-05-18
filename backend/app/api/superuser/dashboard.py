from fastapi import APIRouter, Depends

from app.dependencies import require_role
from app.services.superuser_service import SuperUserService
from app.core.entities import SuperuserDashboard, AnalyticsUsage, AuditLogEntry

router = APIRouter(prefix="/api/superuser", tags=["superuser"])


def get_superuser_service():
    """FastAPI dependency for SuperUserService."""
    from app.config import get_settings
    settings = get_settings()
    return SuperUserService(settings)


@router.get("/dashboard", response_model=SuperuserDashboard)
async def get_dashboard(
    current_user: dict = Depends(require_role(["superuser"])),
    service: SuperUserService = Depends(get_superuser_service),
):
    """Cross-tenant analytics overview."""
    return service.get_cross_tenant_analytics()


@router.get("/tenants")
async def list_tenants(
    current_user: dict = Depends(require_role(["superuser"])),
    service: SuperUserService = Depends(get_superuser_service),
):
    """List all tenants."""
    # TODO: query all tenants from database
    # MVP placeholder
    return [
        {
            "id": 1,
            "name": "Conjunto Altah",
            "plan": "professional",
            "subscription_status": "active",
            "total_units": 120,
            "is_active": True,
        },
        {
            "id": 2,
            "name": "Torres del Parque",
            "plan": "basic",
            "subscription_status": "active",
            "total_units": 45,
            "is_active": True,
        },
    ]


@router.get("/tenants/{tenant_id}/users")
async def get_tenant_users(
    tenant_id: int,
    current_user: dict = Depends(require_role(["superuser"])),
    service: SuperUserService = Depends(get_superuser_service),
):
    """Get all users associated with a tenant."""
    return service.get_tenant_users(tenant_id)


@router.get("/audit", response_model=list[AuditLogEntry])
async def get_global_audit(
    limit: int = 100,
    offset: int = 0,
    tenant_id: int | None = None,
    current_user: dict = Depends(require_role(["superuser"])),
    service: SuperUserService = Depends(get_superuser_service),
):
    """Get global audit logs."""
    return service.get_global_audit_logs(limit=limit, offset=offset, tenant_id=tenant_id)


@router.get("/analytics/usage", response_model=AnalyticsUsage)
async def get_usage_analytics(
    tenant_id: int,
    current_user: dict = Depends(require_role(["superuser"])),
    service: SuperUserService = Depends(get_superuser_service),
):
    """Get usage stats for a specific tenant."""
    return service.get_tenant_usage(tenant_id)


@router.get("/analytics/revenue")
async def get_revenue(
    current_user: dict = Depends(require_role(["superuser"])),
    service: SuperUserService = Depends(get_superuser_service),
):
    """Get subscription revenue data."""
    return service.get_revenue()
