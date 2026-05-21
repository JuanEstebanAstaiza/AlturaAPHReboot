from fastapi import APIRouter, Depends
from sqlalchemy import text

from app.dependencies import get_db, require_role
from app.core.entities import AdminCreateRequest
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/superuser/admins", tags=["admin creation"])


@router.post("/create")
async def create_admin_user(
    request: AdminCreateRequest,
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
):
    """Create a new admin user and assign them to a tenant."""
    from app.services.admin_service import AdminService
    from app.config import get_settings
    settings = get_settings()
    service = AdminService(settings)
    return service.create_admin_user(request, current_user["sub"], db)


@router.get("/available")
async def list_available_users(
    current_user: dict = Depends(require_role(["superuser"])),
    db: Session = Depends(get_db),
):
    """List all active users who are NOT yet assigned as admins (for assignment)."""
    result = db.execute(
        text("""SELECT u.id, u.email, u.name, u.is_active
           FROM users u
           WHERE u.id NOT IN (SELECT DISTINCT ta.user_id FROM tenant_admins ta)
           AND u.is_active = true
           ORDER BY u.name""")
    )
    return [{"id": r[0], "email": r[1], "name": r[2], "is_active": r[3]} for r in result.fetchall()]
