from fastapi import APIRouter, Depends

from app.dependencies import get_db, require_role, get_current_user
from app.core.entities import ResidentDirectoryEntry
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/residents", tags=["residents"])


def get_resident_service(db: Session = Depends(get_db)):
    from app.config import get_settings
    settings = get_settings()
    from app.services.resident_service import ResidentService
    return ResidentService(settings)


@router.get("", response_model=list[ResidentDirectoryEntry])
async def get_directory(
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
    service = Depends(get_resident_service),
):
    """Get resident directory for the current tenant scope."""
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        from app.core.exceptions import AuthorizationError
        raise AuthorizationError("Tenant scope required but not provided")
    return service.get_directory(tenant_id, db)


@router.get("/{user_id}", response_model=dict)
async def get_profile(
    user_id: int,
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
    service = Depends(get_resident_service),
):
    """Get resident profile."""
    return service.get_profile(user_id, db)
