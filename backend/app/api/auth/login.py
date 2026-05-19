from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.services.auth_service import AuthService
from app.services.tenant_service import TenantService
from app.services.resident_service import ResidentService
from app.config import get_settings
from app.core.entities import LoginRequest, LoginResponse, TenantInfo, MyAccessInfo, RegisterRequest, TenantSelectRequest
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.repositories.user_repository import UserRepository
from app.repositories.tenant_repository import TenantRepository
from app.repositories.resident_repository import ResidentRepository

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

    user = user_repo.find_by_email(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    try:
        if not auth_service.verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    role = user_repo.get_user_role(user.id)

    # Determine tenant scope to include in token
    tenant_id = None
    tenant_plan = None
    if role != "superuser":
        res_repo = ResidentRepository(db)
        resident = res_repo.find_by_user_id(user.id)
        if resident:
            tenant_id = resident.tenant_id
            tenant_repo = TenantRepository(db)
            tenant = tenant_repo.find_by_id(tenant_id)
            if tenant:
                tenant_plan = tenant_repo.get_plan_code(tenant_id)
        else:
            # User is admin but not a resident — get first admin tenant
            admin_tenants = user_repo.get_admin_tenants(user.id)
            if admin_tenants:
                tenant_id = admin_tenants[0]
                tenant_repo = TenantRepository(db)
                tenant_plan = tenant_repo.get_plan_code(tenant_id)

    extra_claims = {}
    if tenant_id:
        extra_claims["tenant_id"] = tenant_id
        extra_claims["tenant_plan"] = tenant_plan or "free"

    access_token = auth_service.create_access_token(user.id, role, **extra_claims)
    refresh_token = auth_service.create_refresh_token(user.id, role)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=role,
        name=user.name,
    )


@router.post("/register")
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    """Register a new user. Returns user info."""
    return {"message": "Registration not implemented in MVP-1"}


@router.post("/refresh")
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(),
):
    """Refresh access token using refresh token."""
    return {"message": "Token refresh not implemented in MVP-1"}


@router.get("/tenants", response_model=list[TenantInfo])
async def get_admin_tenants(
    current_user: dict = Depends(get_db),
    db: Session = Depends(get_db),
):
    """Get all tenants an admin manages. Called after login."""
    # MVP: return all active tenants (real data from DB)
    from app.repositories.tenant_repository import TenantRepository
    repo = TenantRepository(db)
    tenants = repo.list_all()
    result = []
    for t in tenants:
        plan_code = repo.get_plan_code(t.id)
        from app.core.constants import SUBSCRIPTION_PLANS
        plan = SUBSCRIPTION_PLANS.get(plan_code or "free", {})
        result.append({
            "tenant_id": t.id,
            "tenant_name": t.name,
            "plan": plan_code or "free",
            "features": plan.get("features", {}),
            "subscription_status": t.subscription_status,
            "total_units": t.total_units,
        })
    return result


@router.get("/my-access", response_model=list[MyAccessInfo])
async def get_resident_my_access(
    current_user: dict = Depends(get_db),
    db: Session = Depends(get_db),
):
    """Get all properties a resident/owner has access to. Called after login."""
    # MVP: return mock data (real data requires user_tenant_access table populated)
    return [
        {
            "tenant_id": 1,
            "tenant_name": "Conjunto Altah",
            "unit_name": "Torre A-101",
            "access_type": "owner",
        },
    ]


@router.post("/tenant-select")
async def tenant_select(
    request: TenantSelectRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Select a tenant context. Returns new JWT with tenant scope."""
    from app.repositories.tenant_repository import TenantRepository
    from app.core.constants import SUBSCRIPTION_PLANS

    repo = TenantRepository(db)
    tenant = repo.find_by_id(request.tenant_id)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    plan_code = repo.get_plan_code(request.tenant_id)
    plan = SUBSCRIPTION_PLANS.get(plan_code or "free", {})

    settings = get_settings()
    auth_service = AuthService(settings)
    new_token = auth_service.create_access_token(
        current_user["sub"], current_user["role"],
        tenant_id=request.tenant_id, tenant_plan=plan_code or "free",
        features=plan.get("features", {}),
    )

    return {
        "access_token": new_token,
        "tenant_id": request.tenant_id,
        "tenant_name": tenant.name,
        "plan": plan_code or "free",
        "features": plan.get("features", {}),
    }
