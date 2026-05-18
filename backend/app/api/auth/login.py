from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.services.auth_service import AuthService
from app.config import get_settings
from app.core.entities import LoginRequest, LoginResponse, TenantInfo, MyAccessInfo
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    """Login endpoint. Returns JWT tokens."""
    settings = get_settings()
    auth_service = AuthService(settings)
    user_repo = UserRepository(db)

    # Find user by email
    user = user_repo.find_by_email(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not auth_service.verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # Get user role
    role = user_repo.get_user_role(user.id)

    # Create tokens
    access_token = auth_service.create_access_token(user.id, role)
    refresh_token = auth_service.create_refresh_token(user.id, role)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=role,
        name=user.name,
    )


@router.post("/register")
async def register(
    request: "app.core.entities.RegisterRequest",
    db: Session = Depends(get_db),
):
    """Register a new user. Returns user info."""
    # TODO: implement registration logic
    # MVP placeholder
    return {"message": "Registration not implemented in MVP-1"}


@router.post("/refresh")
async def refresh_token(
    credentials: "fastapi.security.HTTPAuthorizationCredentials" = Depends(),
):
    """Refresh access token using refresh token."""
    # TODO: implement token refresh
    # MVP placeholder
    return {"message": "Token refresh not implemented in MVP-1"}


@router.get("/tenants", response_model=list[TenantInfo])
async def get_admin_tenants(
    current_user: dict = Depends(get_db),  # TODO: fix dependency
):
    """Get all tenants an admin manages. Called after login."""
    # TODO: query tenant_admins for this user
    # MVP placeholder with mock data
    return [
        {
            "tenant_id": 1,
            "tenant_name": "Conjunto Altah",
            "plan": "professional",
            "features": {"pqrs": True, "documents": True, "reservations": True, "assemblies": True, "convivencia": True, "admin_dashboard": True},
            "subscription_status": "active",
            "total_units": 120,
        },
        {
            "tenant_id": 2,
            "tenant_name": "Torres del Parque",
            "plan": "basic",
            "features": {"pqrs": True, "documents": True, "reservations": True, "resident_portal": True, "admin_dashboard": True},
            "subscription_status": "active",
            "total_units": 45,
        },
    ]


@router.get("/my-access", response_model=list[MyAccessInfo])
async def get_resident_my_access(
    current_user: dict = Depends(get_db),  # TODO: fix dependency
):
    """Get all properties a resident/owner has access to. Called after login."""
    # TODO: query user_tenant_access + resident_unit_link
    # MVP placeholder with mock data
    return [
        {
            "tenant_id": 1,
            "tenant_name": "Conjunto Altah",
            "unit_name": "Torre A-101",
            "access_type": "owner",
        },
        {
            "tenant_id": 3,
            "tenant_name": "Residencial El Bosque",
            "unit_name": "Casa 12",
            "access_type": "owner",
        },
    ]


@router.post("/tenant-select")
async def tenant_select(
    request: "app.core.entities.TenantSelectRequest",
    current_user: dict = Depends(get_db),  # TODO: fix dependency
):
    """Select a tenant context. Returns new JWT with tenant scope."""
    # TODO: validate tenant_admins for admin, user_tenant_access for resident
    # TODO: refresh JWT with tenant_id + tenant_plan
    # MVP placeholder
    return {
        "access_token": "eyJ_placeholder_new_jwt_with_tenant_scope",
        "tenant_id": request.tenant_id,
        "tenant_name": "Conjunto Altah",
        "plan": "professional",
        "features": {"pqrs": True, "documents": True, "reservations": True, "assemblies": True, "convivencia": True, "admin_dashboard": True},
    }
