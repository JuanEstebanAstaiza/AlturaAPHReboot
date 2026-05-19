from fastapi import APIRouter, Depends

from app.dependencies import get_db, require_role, get_current_user
from app.core.entities import TowerCreate, TowerDetail
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/units", tags=["units"])


def get_unit_service(db: Session = Depends(get_db)):
    from app.repositories.unit_repository import UnitRepository
    return UnitRepository(db)


from app.repositories.unit_repository import UnitRepository


@router.get("/towers", response_model=list[TowerDetail])
async def get_towers(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List towers for the current tenant scope."""
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        from app.core.exceptions import AuthorizationError
        raise AuthorizationError("Tenant scope required but not provided")
    repo = UnitRepository(db)
    return repo.get_towers(tenant_id)


@router.get("/towers/{tower_id}", response_model=TowerDetail)
async def get_tower_detail(
    tower_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get tower detail."""
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        from app.core.exceptions import AuthorizationError
        raise AuthorizationError("Tenant scope required but not provided")
    repo = UnitRepository(db)
    tower = repo.get_tower_detail(tenant_id, tower_id)
    if not tower:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tower not found")
    return tower


@router.post("/towers", response_model=TowerDetail)
async def create_tower(
    request: TowerCreate,
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Create a new tower (admin only)."""
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        from app.core.exceptions import AuthorizationError
        raise AuthorizationError("Tenant scope required but not provided")
    repo = UnitRepository(db)
    return repo.create_tower(tenant_id, request.name, request.code, request.floor_count)
