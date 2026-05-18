import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.config import Settings
from app.core.constants import DEFAULT_ROLE_PERMISSIONS


class AuthService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def create_access_token(self, user_id: int, role: str, **extra_claims) -> str:
        """Create JWT access token with user info and optional tenant scope."""
        payload = {
            "sub": str(user_id),
            "role": role,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=self.settings.JWT_ACCESS_EXPIRE_MINUTES),
            "iat": datetime.now(timezone.utc),
            **extra_claims,
        }
        return jwt.encode(payload, self.settings.JWT_SECRET_KEY, algorithm=self.settings.JWT_ALGORITHM)

    def create_refresh_token(self, user_id: int, role: str) -> str:
        """Create JWT refresh token."""
        payload = {
            "sub": str(user_id),
            "role": role,
            "type": "refresh",
            "exp": datetime.now(timezone.utc) + timedelta(days=self.settings.JWT_REFRESH_EXPIRE_DAYS),
            "iat": datetime.now(timezone.utc),
        }
        return jwt.encode(payload, self.settings.JWT_SECRET_KEY, algorithm=self.settings.JWT_ALGORITHM)

    def validate_token(self, token: str) -> Optional[dict]:
        """Validate JWT and return decoded payload."""
        try:
            payload = jwt.decode(
                token,
                self.settings.JWT_SECRET_KEY,
                algorithms=[self.settings.JWT_ALGORITHM],
            )
            # Check expiry
            if payload.get("exp", 0) < datetime.now(timezone.utc).timestamp():
                return None
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def hash_password(self, password: str) -> str:
        """Hash password with bcrypt."""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
        return hashed.decode("utf-8")

    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against bcrypt hash."""
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))

    def get_role_permissions(self, role: str) -> list[str]:
        """Get feature permissions for a role."""
        return DEFAULT_ROLE_PERMISSIONS.get(role, [])

    def build_user_context(self, user: dict, tenant_id: Optional[int] = None, tenant_plan: Optional[str] = None) -> dict:
        """Build JWT context from user data."""
        role = user.get("role", "resident")
        features = {}

        if role == "superuser":
            features = {k: True for k in DEFAULT_ROLE_PERMISSIONS.get("superuser", [])}
        else:
            role_permissions = self.get_role_permissions(role)
            if tenant_plan:
                from app.core.constants import SUBSCRIPTION_PLANS
                plan_features = SUBSCRIPTION_PLANS.get(tenant_plan, {}).get("features", {})
                features = {k: v for k, v in plan_features.items() if k in role_permissions}
            else:
                features = {k: True for k in role_permissions}

        context = {
            "sub": user.get("id"),
            "role": role,
            "name": user.get("name"),
            "features": features,
        }

        if tenant_id:
            context["tenant_id"] = tenant_id
            context["tenant_plan"] = tenant_plan
        if user.get("unit_id"):
            context["unit_id"] = user["unit_id"]

        return context
