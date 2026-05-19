from fastapi import APIRouter, Depends

from app.dependencies import get_db, get_current_user
from app.core.entities import UnitDetail
from sqlalchemy.orm import Session
from app.repositories.unit_repository import UnitRepository

router = APIRouter(prefix="/api/units", tags=["units"])


@router.get("", response_model=list[UnitDetail])
async def get_units(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all habitational units for the current tenant scope."""
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        from app.core.exceptions import AuthorizationError
        raise AuthorizationError("Tenant scope required but not provided")
    from app.repositories.unit_repository import UnitRepository
    repo = UnitRepository(db)
    return repo.get_units(tenant_id)


@router.get("/{unit_id}", response_model=UnitDetail)
async def get_unit_detail(
    unit_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get unit detail."""
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        from app.core.exceptions import AuthorizationError
        raise AuthorizationError("Tenant scope required but not provided")
    from app.repositories.unit_repository import UnitRepository
    repo = UnitRepository(db)
    unit = repo.get_unit_detail(tenant_id, unit_id)
    if not unit:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")
    return unit
