from dataclasses import dataclass
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text


@dataclass
class TenantRecord:
    id: int
    name: str
    address: Optional[str]
    total_units: int
    plan_id: Optional[int]
    subscription_status: str
    subscription_start: Optional[str]
    subscription_end: Optional[str]
    is_active: bool


class TenantRepository:
    """Repository for tenant operations with real DB queries."""

    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, tenant_id: int) -> Optional[TenantRecord]:
        result = self.db.execute(
            text("SELECT id, name, address, total_units, plan_id, subscription_status, subscription_start, subscription_end, is_active FROM tenants WHERE id = :id"),
            {"id": tenant_id},
        )
        row = result.fetchone()
        if not row:
            return None
        return TenantRecord(
            id=row[0], name=row[1], address=row[2], total_units=row[3],
            plan_id=row[4], subscription_status=row[5],
            subscription_start=row[6], subscription_end=row[7], is_active=row[8],
        )

    def list_all(self) -> list[TenantRecord]:
        result = self.db.execute(
            text("SELECT id, name, address, total_units, plan_id, subscription_status, subscription_start, subscription_end, is_active FROM tenants WHERE is_active = true"),
        )
        rows = result.fetchall()
        return [
            TenantRecord(
                id=r[0], name=r[1], address=r[2], total_units=r[3],
                plan_id=r[4], subscription_status=r[5],
                subscription_start=r[6], subscription_end=r[7], is_active=r[8],
            )
            for r in rows
        ]

    def create(self, name: str, address: Optional[str], total_units: int, plan_id: int, created_by: int) -> TenantRecord:
        result = self.db.execute(
            text("INSERT INTO tenants (name, address, total_units, plan_id, created_by, is_active) VALUES (:name, :address, :total_units, :plan_id, :created_by, true) RETURNING id, name, address, total_units, plan_id, subscription_status, subscription_start, subscription_end, is_active"),
            {"name": name, "address": address, "total_units": total_units, "plan_id": plan_id, "created_by": created_by},
        )
        row = result.fetchone()
        return TenantRecord(
            id=row[0], name=row[1], address=row[2], total_units=row[3],
            plan_id=row[4], subscription_status=row[5],
            subscription_start=row[6], subscription_end=row[7], is_active=row[8],
        )

    def update(self, tenant_id: int, **fields) -> Optional[TenantRecord]:
        allowed = {"name", "address", "total_units", "subscription_status"}
        set_clauses = []
        params = {"id": tenant_id}
        for key in allowed:
            if key in fields and fields[key] is not None:
                set_clauses.append(f"{key} = :{key}")
                params[key] = fields[key]
        if not set_clauses:
            return self.find_by_id(tenant_id)
        set_clauses.append("updated_at = NOW()")
        result = self.db.execute(
            text(f"UPDATE tenants SET {', '.join(set_clauses)} WHERE id = :id RETURNING id, name, address, total_units, plan_id, subscription_status, subscription_start, subscription_end, is_active"),
            params,
        )
        row = result.fetchone()
        if not row:
            return None
        return TenantRecord(
            id=row[0], name=row[1], address=row[2], total_units=row[3],
            plan_id=row[4], subscription_status=row[5],
            subscription_start=row[6], subscription_end=row[7], is_active=row[8],
        )

    def assign_plan(self, tenant_id: int, plan_id: int) -> Optional[TenantRecord]:
        result = self.db.execute(
            text("UPDATE tenants SET plan_id = :plan_id, updated_at = NOW() WHERE id = :id RETURNING id, name, address, total_units, plan_id, subscription_status, subscription_start, subscription_end, is_active"),
            {"id": tenant_id, "plan_id": plan_id},
        )
        row = result.fetchone()
        if not row:
            return None
        return TenantRecord(
            id=row[0], name=row[1], address=row[2], total_units=row[3],
            plan_id=row[4], subscription_status=row[5],
            subscription_start=row[6], subscription_end=row[7], is_active=row[8],
        )

    def get_plan_code(self, tenant_id: int) -> Optional[str]:
        result = self.db.execute(
            text("SELECT sp.code FROM tenants t JOIN subscription_plans sp ON t.plan_id = sp.id WHERE t.id = :id"),
            {"id": tenant_id},
        )
        row = result.fetchone()
        return row[0] if row else None
