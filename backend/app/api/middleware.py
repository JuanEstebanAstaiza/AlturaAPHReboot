from fastapi import Request, status
from fastapi.responses import JSONResponse
import structlog

from app.services.auth_service import AuthService
from app.services.tenant_service import TenantService
from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


async def auth_middleware(request: Request, call_next):
    """Middleware for authentication and tenant scope validation."""
    # Skip auth for health check and login
    if request.url.path in ("/health", "/api/auth/login", "/docs", "/openapi.json"):
        return await call_next(request)

    # Get token from Authorization header
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Missing or invalid Authorization header"},
        )

    token = auth_header.split(" ")[1]

    # Validate token
    auth_service = AuthService(settings)
    user_context = auth_service.validate_token(token)

    if not user_context:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid or expired token"},
        )

    # Superuser: no tenant scope needed
    if user_context.get("role") == "superuser":
        # Attach user context to request state
        request.state.user = user_context
        return await call_next(request)

    # Regular users: tenant scope required
    tenant_id = user_context.get("tenant_id")
    if not tenant_id:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Tenant scope required but not provided"},
        )

    # Check subscription status
    tenant_service = TenantService(settings)
    sub_status = tenant_service.check_subscription_status(tenant_id)
    if sub_status == "expired":
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Tenant subscription expired"},
        )

    # Attach user context to request state
    request.state.user = user_context
    request.state.tenant_id = tenant_id

    return await call_next(request)
