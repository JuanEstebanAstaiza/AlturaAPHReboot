from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from app.dependencies import get_db, require_role, get_current_user
from app.services.pqrs_service import PQRSService
from app.config import get_settings
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/pqrs", tags=["PQRS"])


def get_pqrs_service(db: Session = Depends(get_db)):
    settings = get_settings()
    return PQRSService(settings)


def _get_tenant_id(current_user: dict) -> int:
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        return JSONResponse(status_code=400, content={"error": "tenant_id required"})
    return tenant_id


# ---- Ticket CRUD ----

@router.post("/tickets")
async def create_ticket(
    type: str = Query(..., description="PQRS type: p, q, r, s"),
    priority: str = Query("medium", description="Priority: low, medium, high, urgent"),
    title: str = Query(..., min_length=1, max_length=300),
    description: str = Query(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: PQRSService = Depends(get_pqrs_service),
):
    """Create a new PQRS ticket."""
    tenant_id = _get_tenant_id(current_user)
    if isinstance(tenant_id, JSONResponse):
        return tenant_id

    # Get tenant plan from middleware state or user context
    tenant_plan = current_user.get("tenant_plan", "free")

    return service.create_ticket(
        user_id=current_user["sub"],
        tenant_id=tenant_id,
        tenant_plan=tenant_plan,
        pqrs_type=type,
        priority=priority,
        title=title,
        description=description,
        db=db,
    )


@router.get("/tickets")
async def list_tickets(
    status: str | None = Query(None),
    priority: str | None = Query(None),
    type: str | None = Query(None),
    assigned_to: int | None = Query(None),
    search: str | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: PQRSService = Depends(get_pqrs_service),
):
    """List PQRS tickets for current tenant."""
    tenant_id = _get_tenant_id(current_user)
    if isinstance(tenant_id, JSONResponse):
        return tenant_id
    tenant_plan = current_user.get("tenant_plan", "free")

    return service.list_tickets(
        tenant_id=tenant_id,
        tenant_plan=tenant_plan,
        status=status, priority=priority, type=type,
        assigned_to=assigned_to, search=search,
        limit=limit, offset=offset,
        db=db,
    )


@router.get("/tickets/{ticket_id}")
async def get_ticket(
    ticket_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: PQRSService = Depends(get_pqrs_service),
):
    """Get PQRS ticket detail."""
    tenant_id = _get_tenant_id(current_user)
    if isinstance(tenant_id, JSONResponse):
        return tenant_id

    return service.get_ticket(ticket_id, tenant_id, db)


@router.put("/tickets/{ticket_id}")
async def update_ticket(
    ticket_id: int,
    status: str | None = Query(None),
    priority: str | None = Query(None),
    assigned_to: int | None = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: PQRSService = Depends(get_pqrs_service),
):
    """Update PQRS ticket (status, priority, assignment). Admin only."""
    tenant_id = _get_tenant_id(current_user)
    if isinstance(tenant_id, JSONResponse):
        return tenant_id

    return service.update_ticket(
        ticket_id=ticket_id,
        tenant_id=tenant_id,
        user_id=current_user["sub"],
        status=status, priority=priority, assigned_to=assigned_to,
        db=db,
    )


@router.put("/tickets/{ticket_id}/status")
async def update_status(
    ticket_id: int,
    status: str = Query(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: PQRSService = Depends(get_pqrs_service),
):
    """Update PQRS ticket status. Admin only."""
    tenant_id = _get_tenant_id(current_user)
    if isinstance(tenant_id, JSONResponse):
        return tenant_id

    return service.update_status(
        ticket_id=ticket_id,
        tenant_id=tenant_id,
        user_id=current_user["sub"],
        new_status=status,
        db=db,
    )


@router.put("/tickets/{ticket_id}/assign")
async def assign_ticket(
    ticket_id: int,
    user_id: int = Query(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: PQRSService = Depends(get_pqrs_service),
):
    """Assign PQRS ticket to a user. Admin only."""
    tenant_id = _get_tenant_id(current_user)
    if isinstance(tenant_id, JSONResponse):
        return tenant_id

    return service.assign_ticket(
        ticket_id=ticket_id,
        tenant_id=tenant_id,
        user_id=current_user["sub"],
        target_user_id=user_id,
        db=db,
    )


# ---- Comments ----

@router.get("/tickets/{ticket_id}/comments")
async def get_comments(
    ticket_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: PQRSService = Depends(get_pqrs_service),
):
    """Get comments for a PQRS ticket."""
    tenant_id = _get_tenant_id(current_user)
    if isinstance(tenant_id, JSONResponse):
        return tenant_id

    return service.get_comments(ticket_id, tenant_id, db)


@router.post("/tickets/{ticket_id}/comments")
async def add_comment(
    ticket_id: int,
    message: str = Query(..., min_length=1),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: PQRSService = Depends(get_pqrs_service),
):
    """Add a comment to a PQRS ticket."""
    tenant_id = _get_tenant_id(current_user)
    if isinstance(tenant_id, JSONResponse):
        return tenant_id

    return service.add_comment(
        ticket_id=ticket_id,
        tenant_id=tenant_id,
        user_id=current_user["sub"],
        message=message,
        db=db,
    )


# ---- Attachments ----

@router.get("/tickets/{ticket_id}/attachments")
async def get_attachments(
    ticket_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: PQRSService = Depends(get_pqrs_service),
):
    """Get attachments for a PQRS ticket."""
    tenant_id = _get_tenant_id(current_user)
    if isinstance(tenant_id, JSONResponse):
        return tenant_id

    return service.get_attachments(ticket_id, tenant_id, db)


# ---- Stats ----

@router.get("/stats")
async def get_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: PQRSService = Depends(get_pqrs_service),
):
    """Get PQRS statistics for current tenant."""
    tenant_id = _get_tenant_id(current_user)
    if isinstance(tenant_id, JSONResponse):
        return tenant_id

    return service.get_stats(tenant_id, db)


# ---- Categories ----

@router.get("/categories")
async def get_categories(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: PQRSService = Depends(get_pqrs_service),
):
    """Get PQRS categories for current tenant."""
    tenant_id = _get_tenant_id(current_user)
    if isinstance(tenant_id, JSONResponse):
        return tenant_id

    return service.get_categories(tenant_id, db)


@router.post("/categories")
async def create_category(
    name: str = Query(..., min_length=1, max_length=100),
    pqrs_type: str = Query(...),
    default_assigned_user_id: int | None = Query(None),
    escalation_timeout_hours: int = Query(48),
    current_user: dict = Depends(require_role(["admin", "comite", "superuser"])),
    db: Session = Depends(get_db),
    service: PQRSService = Depends(get_pqrs_service),
):
    """Create a PQRS category. Admin/Comite only."""
    tenant_id = _get_tenant_id(current_user)
    if isinstance(tenant_id, JSONResponse):
        return tenant_id

    return service.create_category(
        tenant_id=tenant_id,
        admin_id=current_user["sub"],
        name=name,
        pqrs_type=pqrs_type,
        default_assigned_user_id=default_assigned_user_id,
        escalation_timeout_hours=escalation_timeout_hours,
        db=db,
    )
