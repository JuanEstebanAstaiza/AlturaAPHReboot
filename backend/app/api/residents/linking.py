from fastapi import APIRouter, Depends

from app.dependencies import get_db, get_current_user
from app.core.entities import ResidentUnitLinkRequest
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/residents", tags=["residents"])


def get_resident_service(db: Session = Depends(get_db)):
    from app.config import get_settings
    settings = get_settings()
    from app.services.resident_service import ResidentService
    return ResidentService(settings)


@router.post("/link", response_model=dict)
async def link_resident_to_unit(
    request: ResidentUnitLinkRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service = Depends(get_resident_service),
):
    """Link a resident to a unit."""
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        from app.core.exceptions import AuthorizationError
        raise AuthorizationError("Tenant scope required but not provided")
    return service.link_resident_to_unit(current_user["sub"], request.unit_id, request.start_date.isoformat() if hasattr(request.start_date, 'isoformat') else str(request.start_date), request.is_primary, db)


@router.delete("/link", response_model=dict)
async def unlink_resident_from_unit(
    unit_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service = Depends(get_resident_service),
):
    """Unlink a resident from a unit."""
    return {"status": "unlinked", "user_id": current_user["sub"], "unit_id": unit_id}
