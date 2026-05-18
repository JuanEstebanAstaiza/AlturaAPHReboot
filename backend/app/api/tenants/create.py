from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_role
from app.services.tenant_service import TenantService
from app.core.entities import TenantCreate, TenantDetail, PlanAssignment, AdminAssignment

router = APIRouter(prefix="/api/tenants", tags=["tenants"])


@router.post("")
async def create_tenant(
    request: TenantCreate,
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
):
    """Create a new tenant (superuser only)."""
    # TODO: validate plan exists, check max_tenants for creator
    # MVP placeholder
    return {
        "message": "Tenant creation not implemented in MVP-1",
        "request": request.model_dump(),
    }


@router.put("/{tenant_id}/plan")
async def assign_plan(
    tenant_id: int,
    request: PlanAssignment,
    current_user: dict = Depends(require_role(["superuser"])),
    service: TenantService = Depends(lambda: TenantService(None)),  # TODO: pass settings
):
    """Assign/change subscription plan for a tenant."""
    return service.assign_plan(tenant_id, request.plan_id)


@router.post("/{tenant_id}/admins")
async def add_admin(
    tenant_id: int,
    request: AdminAssignment,
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
):
    """Assign an admin to a tenant."""
    # TODO: insert into tenant_admins table
    # MVP placeholder
    return {
        "message": "Admin assignment not implemented in MVP-1",
        "tenant_id": tenant_id,
        "user_id": request.user_id,
    }
