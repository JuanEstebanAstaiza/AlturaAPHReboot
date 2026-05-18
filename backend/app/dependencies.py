from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import get_settings
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.services.auth_service import AuthService


security = HTTPBearer()


def get_db():
    """FastAPI dependency for database session."""
    # TODO: implement SQLAlchemy session management
    # For now, placeholder
    yield None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Extract and validate JWT, return user dict."""
    settings = get_settings()
    token = credentials.credentials

    auth_service = AuthService(settings)
    user = auth_service.validate_token(token)

    if not user:
        raise AuthenticationError("Invalid or expired token")

    return user


def require_role(required_roles: list[str]):
    """FastAPI dependency that requires a specific role."""
    async def dep(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in required_roles:
            raise AuthorizationError(
                f"Role '{current_user.get('role')}' not in required roles: {required_roles}"
            )
        return current_user
    return dep


def require_tenant_scope():
    """Ensure request has valid tenant scope."""
    async def dep(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        if current_user.get("role") == "superuser":
            return current_user  # superuser has no tenant scope

        tenant_id = current_user.get("tenant_id")
        if not tenant_id:
            raise AuthorizationError("Tenant scope required but not provided")

        return current_user
    return dep


def check_feature_access(feature: str):
    """Dependency that checks if tenant plan includes the feature."""
    async def dep(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        role = current_user.get("role")
        if role == "superuser":
            return current_user

        tenant_plan = current_user.get("tenant_plan")
        features = current_user.get("features", {})

        if not features.get(feature, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "feature_not_available",
                    "feature": feature,
                    "tenant_plan": tenant_plan,
                    "available_features": [k for k, v in features.items() if v],
                },
            )

        return current_user
    return dep
