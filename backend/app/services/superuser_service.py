from typing import Optional
from sqlalchemy import text
from app.config import Settings
from app.core.constants import SUBSCRIPTION_PLANS
from app.repositories.tenant_repository import TenantRepository
from app.repositories.user_repository import UserRepository
from app.repositories.resident_repository import ResidentRepository


class SuperUserService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def get_cross_tenant_analytics(self, db) -> dict:
        tenant_repo = TenantRepository(db)
        user_repo = UserRepository(db)

        all_tenants = tenant_repo.list_all()
        total_tenants = len(all_tenants)
        active_tenants = sum(1 for t in all_tenants if t.is_active and t.subscription_status == "active")

        # Count all users
        result = db.execute(text("SELECT COUNT(*) FROM users WHERE is_active = true"))
        total_users = result.fetchone()[0]

        # Revenue by plan
        result = db.execute(text("""
            SELECT sp.code, COUNT(t.id), SUM(sp.monthly_price)
            FROM tenants t JOIN subscription_plans sp ON t.plan_id = sp.id
            WHERE t.is_active = true
            GROUP BY sp.code
        """))
        subscriptions_by_plan = {}
        total_revenue = 0.0
        for r in result.fetchall():
            subscriptions_by_plan[r[0]] = r[1]
            total_revenue += float(r[2])

        return {
            "total_tenants": total_tenants,
            "active_tenants": active_tenants,
            "total_users": total_users,
            "total_revenue": total_revenue,
            "subscriptions_by_plan": subscriptions_by_plan,
        }

    def get_tenant_users(self, tenant_id: int, db) -> list[dict]:
        user_repo = UserRepository(db)
        return user_repo.get_tenant_users(tenant_id)

    def get_global_audit_logs(self, limit: int = 100, offset: int = 0, tenant_id: Optional[int] = None, db=None) -> list[dict]:
        result = db.execute(text("""
            SELECT al.id, al.user_id, u.name as user_name,
                   al.tenant_id, t.name as tenant_name,
                   al.action, al.resource, al.resource_id, al.details,
                   al.ip_address, al.timestamp
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            LEFT JOIN tenants t ON al.tenant_id = t.id
            WHERE (:tid IS NULL OR al.tenant_id = :tid)
            ORDER BY al.timestamp DESC
            LIMIT :lim OFFSET :off
        """), {"tid": tenant_id, "lim": limit, "off": offset})
        return [
            {
                "id": r[0], "user_id": r[1], "user_name": r[2],
                "tenant_id": r[3], "tenant_name": r[4],
                "action": r[5], "resource": r[6], "resource_id": r[7],
                "details": r[8], "ip_address": r[9], "timestamp": r[10],
            }
            for r in result.fetchall()
        ]

    def get_tenant_usage(self, tenant_id: int, db) -> dict:
        tenant_repo = TenantRepository(db)
        tenant = tenant_repo.find_by_id(tenant_id)
        if not tenant:
            raise Exception(f"Tenant {tenant_id} not found")

        res_repo = ResidentRepository(db)
        residents_count = res_repo.count_by_tenant(tenant_id)

        # PQRS, documents, reservations counts (0 for MVP since no DDL yet)
        pqrs_count = 0
        documents_count = 0
        reservations_count = 0

        return {
            "tenant_id": tenant_id,
            "tenant_name": tenant.name,
            "pqrs_count": pqrs_count,
            "documents_count": documents_count,
            "reservations_count": reservations_count,
            "residents_count": residents_count,
            "active_users_last_30d": 0,
        }

    def get_revenue(self, db) -> dict:
        result = db.execute(text("""
            SELECT sp.code, COUNT(t.id), SUM(sp.monthly_price)
            FROM tenants t JOIN subscription_plans sp ON t.plan_id = sp.id
            WHERE t.is_active = true
            GROUP BY sp.code
        """))
        by_plan = {}
        total_revenue = 0.0
        monthly_revenue = 0.0
        for r in result.fetchall():
            by_plan[r[0]] = float(r[2])
            total_revenue += float(r[2])
            monthly_revenue += float(r[2])

        return {
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "by_plan": by_plan,
        }
