from fastapi import APIRouter, Depends

from app.dependencies import get_db, require_role
from app.services.superuser_service import SuperUserService
from app.core.entities import SuperuserDashboard, AnalyticsUsage, AuditLogEntry
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/superuser", tags=["superuser"])


def get_superuser_service(db: Session = Depends(get_db)):
    from app.config import get_settings
    settings = get_settings()
    return SuperUserService(settings)


@router.get("/dashboard", response_model=SuperuserDashboard)
async def get_dashboard(
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
    service: SuperUserService = Depends(get_superuser_service),
):
    """Cross-tenant analytics overview."""
    return service.get_cross_tenant_analytics(db)


@router.get("/tenants")
async def list_tenants(
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
):
    """List all tenants."""
    from app.repositories.tenant_repository import TenantRepository
    repo = TenantRepository(db)
    tenants = repo.list_all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "address": t.address,
            "total_units": t.total_units,
            "is_active": t.is_active,
        }
        for t in tenants
    ]


@router.get("/tenants/{tenant_id}")
async def get_tenant_detail(
    tenant_id: int,
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
):
    """Get tenant detail with plan info."""
    from app.services.tenant_service import TenantService
    from app.config import get_settings
    settings = get_settings()
    service = TenantService(settings)
    return service.get_tenant_info(tenant_id, db)


@router.put("/tenants/{tenant_id}/plan")
async def assign_tenant_plan(
    tenant_id: int,
    request: "app.core.entities.PlanAssignment",
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
):
    """Assign/change subscription plan for a tenant."""
    from app.services.tenant_service import TenantService
    from app.config import get_settings
    settings = get_settings()
    service = TenantService(settings)
    return service.assign_plan(tenant_id, request.plan_id, db)


@router.get("/tenants/{tenant_id}/users")
async def get_tenant_users(
    tenant_id: int,
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
    service: SuperUserService = Depends(get_superuser_service),
):
    """Get all users associated with a tenant."""
    return service.get_tenant_users(tenant_id, db)


@router.get("/tenants/{tenant_id}/admins")
async def get_tenant_admins(
    tenant_id: int,
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
):
    """Get admins assigned to a tenant."""
    from app.services.tenant_service import TenantService
    from app.config import get_settings
    settings = get_settings()
    service = TenantService(settings)
    return service.get_tenant_admins(tenant_id, db)


@router.post("/tenants/{tenant_id}/admins")
async def assign_tenant_admin(
    tenant_id: int,
    request: "app.core.entities.AdminAssignment",
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
):
    """Assign an admin to a tenant."""
    from app.services.tenant_service import TenantService
    from app.config import get_settings
    settings = get_settings()
    service = TenantService(settings)
    success = service.assign_admin(tenant_id, request.user_id, current_user["sub"], db)
    return {"tenant_id": tenant_id, "user_id": request.user_id, "status": "assigned" if success else "failed"}


@router.get("/audit", response_model=list[AuditLogEntry])
async def get_global_audit(
    limit: int = 100,
    offset: int = 0,
    tenant_id: int | None = None,
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
    service: SuperUserService = Depends(get_superuser_service),
):
    """Get global audit logs."""
    return service.get_global_audit_logs(limit=limit, offset=offset, tenant_id=tenant_id, db=db)


@router.get("/analytics/usage", response_model=AnalyticsUsage)
async def get_usage_analytics(
    tenant_id: int,
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
    service: SuperUserService = Depends(get_superuser_service),
):
    """Get usage stats for a specific tenant."""
    return service.get_tenant_usage(tenant_id, db)


@router.get("/analytics/revenue")
async def get_revenue(
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
    service: SuperUserService = Depends(get_superuser_service),
):
    """Get subscription revenue data."""
    return service.get_revenue(db)
