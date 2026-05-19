from typing import Optional
from sqlalchemy import text
from app.config import Settings
from app.core.constants import SUBSCRIPTION_PLANS
from app.core.exceptions import TenantNotFoundError, TenantLimitExceededError, FeatureNotAvailableError
from app.repositories.tenant_repository import TenantRepository
from app.repositories.user_repository import UserRepository
from app.repositories.resident_repository import ResidentRepository


class TenantService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def validate_plan_features(self, tenant_plan: str, feature: str) -> bool:
        plan = SUBSCRIPTION_PLANS.get(tenant_plan)
        if not plan:
            return False
        return plan.get("features", {}).get(feature, False)

    def check_max_tenants(self, user_id: int, plan_id: int, db) -> bool:
        user_repo = UserRepository(db)
        count = user_repo.count_current_tenants(user_id)
        result = db.execute(text("SELECT max_tenants FROM subscription_plans WHERE id = :pid"), {"pid": plan_id})
        row = result.fetchone()
        if not row:
            return False
        return count < row[0]

    def get_tenant_info(self, tenant_id: int, db) -> dict:
        repo = TenantRepository(db)
        tenant = repo.find_by_id(tenant_id)
        if not tenant:
            raise TenantNotFoundError(tenant_id)
        plan_code = repo.get_plan_code(tenant_id)
        plan = SUBSCRIPTION_PLANS.get(plan_code, {})
        return {
            "tenant_id": tenant.id,
            "tenant_name": tenant.name,
            "address": tenant.address,
            "total_units": tenant.total_units,
            "plan": plan_code or "free",
            "features": plan.get("features", {}),
            "subscription_status": tenant.subscription_status,
            "subscription_start": tenant.subscription_start,
            "subscription_end": tenant.subscription_end,
            "is_active": tenant.is_active,
        }

    def get_user_tenants(self, user_id: int, db) -> list[int]:
        repo = UserRepository(db)
        return repo.get_admin_tenants(user_id)

    def get_user_my_access(self, user_id: int, db) -> list[dict]:
        repo = UserRepository(db)
        accesses = repo.get_user_tenant_access(user_id)
        tenant_repo = TenantRepository(db)
        result = []
        for acc in accesses:
            tenant = tenant_repo.find_by_id(acc.tenant_id)
            if tenant:
                result.append({
                    "tenant_id": acc.tenant_id,
                    "tenant_name": tenant.name,
                    "access_type": acc.access_type,
                })
        return result

    def assign_plan(self, tenant_id: int, plan_id: int, db) -> dict:
        repo = TenantRepository(db)
        tenant = repo.assign_plan(tenant_id, plan_id)
        if not tenant:
            raise TenantNotFoundError(tenant_id)
        plan_code = repo.get_plan_code(tenant_id)
        return {"tenant_id": tenant.id, "plan_id": plan_id, "plan_code": plan_code, "status": "updated"}

    def check_subscription_status(self, tenant_id: int, db) -> str:
        repo = TenantRepository(db)
        tenant = repo.find_by_id(tenant_id)
        if not tenant:
            raise TenantNotFoundError(tenant_id)
        return tenant.subscription_status

    def throw_feature_not_available(self, feature: str, plan: str):
        raise FeatureNotAvailableError(feature, plan)

    def create_tenant(self, name: str, address: Optional[str], total_units: int, plan_id: int, created_by: int, db) -> dict:
        repo = TenantRepository(db)
        tenant = repo.create(name, address, total_units, plan_id, created_by)
        plan_code = repo.get_plan_code(tenant.id)
        return {
            "tenant_id": tenant.id,
            "tenant_name": tenant.name,
            "address": tenant.address,
            "total_units": tenant.total_units,
            "plan": plan_code or "free",
            "subscription_status": tenant.subscription_status,
            "is_active": tenant.is_active,
        }

    def update_tenant(self, tenant_id: int, fields: dict, db) -> dict:
        repo = TenantRepository(db)
        tenant = repo.update(tenant_id, **fields)
        if not tenant:
            raise TenantNotFoundError(tenant_id)
        plan_code = repo.get_plan_code(tenant_id)
        return {
            "tenant_id": tenant.id,
            "tenant_name": tenant.name,
            "address": tenant.address,
            "total_units": tenant.total_units,
            "plan": plan_code or "free",
            "subscription_status": tenant.subscription_status,
            "is_active": tenant.is_active,
        }

    def assign_admin(self, tenant_id: int, user_id: int, assigned_by: int, db) -> bool:
        repo = UserRepository(db)
        return repo.assign_admin(tenant_id, user_id, assigned_by)

    def get_tenant_admins(self, tenant_id: int, db) -> list[dict]:
        result = db.execute(
            text("SELECT u.id, u.email, u.name FROM users u JOIN tenant_admins ta ON u.id = ta.user_id WHERE ta.tenant_id = :tid AND ta.status = 'active'"),
            {"tid": tenant_id},
        )
        return [{"user_id": r[0], "email": r[1], "name": r[2]} for r in result.fetchall()]

    def get_tenant_residents(self, tenant_id: int, db) -> list[dict]:
        res_repo = ResidentRepository(db)
        return res_repo.get_directory(tenant_id)
