from fastapi import APIRouter, Depends, Query

from app.dependencies import get_db, require_role
from app.core.entities import PlanCreate, PlanUpdate
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/superuser/plans", tags=["subscription plans"])


def get_plan_service(db: Session = Depends(get_db)):
    from app.config import get_settings
    from app.services.plan_service import PlanService
    settings = get_settings()
    return PlanService(settings)


@router.get("")
async def list_plans(
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
    service: PlanService = Depends(get_plan_service),
):
    """List all subscription plans (including inactive)."""
    return service.list_plans(db)


@router.post("")
async def create_plan(
    request: PlanCreate,
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
    service: PlanService = Depends(get_plan_service),
):
    """Create a new subscription plan."""
    return service.create_plan(request, current_user["sub"], db)


@router.put("/{plan_id}")
async def update_plan(
    plan_id: int,
    request: PlanUpdate,
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
    service: PlanService = Depends(get_plan_service),
):
    """Update a subscription plan."""
    return service.update_plan(plan_id, request, current_user["sub"], db)


@router.delete("/{plan_id}")
async def deactivate_plan(
    plan_id: int,
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
    service: PlanService = Depends(get_plan_service),
):
    """Deactivate a subscription plan (soft delete)."""
    return service.deactivate_plan(plan_id, current_user["sub"], db)
