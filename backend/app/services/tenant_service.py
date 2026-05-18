from typing import Optional
from app.config import Settings
from app.core.constants import SUBSCRIPTION_PLANS
from app.core.exceptions import TenantNotFoundError, TenantLimitExceededError, FeatureNotAvailableError


class TenantService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def validate_plan_features(self, tenant_plan: str, feature: str) -> bool:
        """Check if a feature is available in a subscription plan."""
        plan = SUBSCRIPTION_PLANS.get(tenant_plan)
        if not plan:
            return False
        return plan.get("features", {}).get(feature, False)

    def check_max_tenants(self, user_id: int, plan_id: int) -> bool:  # type: ignore[unused-import]
        """Check if admin has exceeded max tenants for their plan."""
        # TODO: query database to count current tenants for this user
        # For MVP placeholder, assume unlimited
        return True

    def get_tenant_info(self, tenant_id: int) -> dict:
        """Get tenant information including plan details."""
        # TODO: query database
        # MVP placeholder
        return {}

    def get_user_tenants(self, user_id: int, role: str) -> list[dict]:
        """Get all tenants a user has access to."""
        # TODO: query tenant_admins for admins, user_tenant_access for residents
        # MVP placeholder
        return []

    def get_user_my_access(self, user_id: int) -> list[dict]:
        """Get all properties a resident/owner has access to."""
        # TODO: query user_tenant_access + resident_unit_link
        # MVP placeholder
        return []

    def assign_plan(self, tenant_id: int, plan_id: int) -> dict:
        """Assign a subscription plan to a tenant."""
        # TODO: update tenant in database
        # MVP placeholder
        return {"tenant_id": tenant_id, "plan_id": plan_id, "status": "updated"}

    def check_subscription_status(self, tenant_id: int) -> str:
        """Check tenant subscription status."""
        # TODO: query tenant subscription_status and compare with subscription_end date
        # MVP placeholder
        return "active"

    def throw_feature_not_available(self, feature: str, plan: str):
        """Raise FeatureNotAvailableError."""
        raise FeatureNotAvailableError(feature, plan)
