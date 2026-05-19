from fastapi import APIRouter, Depends

from app.dependencies import get_db, require_role
from app.core.entities import TenantCreate, TenantUpdate, PlanAssignment, AdminAssignment
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/tenants", tags=["tenants"])


def get_tenant_service(db: Session = Depends(get_db)):
    from app.config import get_settings
    settings = get_settings()
    from app.services.tenant_service import TenantService
    return TenantService(settings)


@router.post("", response_model=dict)
async def create_tenant(
    request: TenantCreate,
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
    service = Depends(get_tenant_service),
):
    """Create a new tenant (admin only)."""
    return service.create_tenant(request.name, request.address, request.total_units, request.plan_id, current_user["sub"], db)


@router.get("/{tenant_id}")
async def get_tenant(
    tenant_id: int,
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
    service = Depends(get_tenant_service),
):
    """Get tenant detail."""
    return service.get_tenant_info(tenant_id, db)


@router.put("/{tenant_id}/plan")
async def assign_tenant_plan(
    tenant_id: int,
    request: PlanAssignment,
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
    service = Depends(get_tenant_service),
):
    """Assign/change subscription plan for a tenant."""
    return service.assign_plan(tenant_id, request.plan_id, db)


@router.post("/{tenant_id}/admins")
async def assign_tenant_admin(
    tenant_id: int,
    request: AdminAssignment,
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
    service = Depends(get_tenant_service),
):
    """Assign an admin to a tenant."""
    success = service.assign_admin(tenant_id, request.user_id, current_user["sub"], db)
    return {"tenant_id": tenant_id, "user_id": request.user_id, "status": "assigned" if success else "failed"}
