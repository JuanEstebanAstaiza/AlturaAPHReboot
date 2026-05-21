from typing import Optional
from sqlalchemy import text

from app.core.entities import PlanCreate, PlanUpdate, PlanDetail


class PlanService:
    def __init__(self, settings):
        self.settings = settings

    def list_plans(self, db) -> list[dict]:
        result = db.execute(
            text("SELECT id, name, code, description, max_tenants, max_residents, features, monthly_price, status, created_at FROM subscription_plans ORDER BY id")
        )
        rows = result.fetchall()
        return [
            {
                "id": r[0],
                "name": r[1],
                "code": r[2],
                "description": r[3],
                "max_tenants": r[4],
                "max_residents": r[5],
                "features": r[6],
                "monthly_price": float(r[7]),
                "status": r[8],
                "created_at": r[9].isoformat() if r[9] else None,
            }
            for r in rows
        ]

    def create_plan(self, request: PlanCreate, created_by: int, db) -> dict:
        db.execute(
            text(
                "INSERT INTO subscription_plans (name, code, description, max_tenants, max_residents, features, monthly_price, status) "
                "VALUES (:name, :code, :desc, :max_t, :max_r, :feat, :price, true) "
                "RETURNING id, name, code, description, max_tenants, max_residents, features, monthly_price, status, created_at"
            ),
            {
                "name": request.name,
                "code": request.code,
                "desc": request.description,
                "max_t": request.max_tenants,
                "max_r": request.max_residents,
                "feat": request.features,
                "price": request.monthly_price,
            },
        )
        db.commit()
        # Need to re-fetch since SQLite RETURNING may not work
        result = db.execute(
            text("SELECT id, name, code, description, max_tenants, max_residents, features, monthly_price, status, created_at FROM subscription_plans WHERE code = :code"),
            {"code": request.code},
        )
        row = result.fetchone()
        if not row:
            raise RuntimeError("Failed to create subscription plan")
        return {
            "id": row[0],
            "name": row[1],
            "code": row[2],
            "description": row[3],
            "max_tenants": row[4],
            "max_residents": row[5],
            "features": row[6],
            "monthly_price": float(row[7]),
            "status": row[8],
            "created_at": row[9].isoformat() if row[9] else None,
        }

    def update_plan(self, plan_id: int, request: PlanUpdate, updated_by: int, db) -> dict:
        fields = []
        params: dict = {"id": plan_id}
        if request.name is not None:
            fields.append("name = :name")
            params["name"] = request.name
        if request.description is not None:
            fields.append("description = :desc")
            params["desc"] = request.description
        if request.max_tenants is not None:
            fields.append("max_tenants = :max_t")
            params["max_t"] = request.max_tenants
        if request.max_residents is not None:
            fields.append("max_residents = :max_r")
            params["max_r"] = request.max_residents
        if request.features is not None:
            fields.append("features = :feat")
            params["feat"] = request.features
        if request.monthly_price is not None:
            fields.append("monthly_price = :price")
            params["price"] = request.monthly_price
        if request.status is not None:
            fields.append("status = :status")
            params["status"] = request.status

        if not fields:
            return self.get_plan_detail(plan_id, db)

        sql = f"UPDATE subscription_plans SET {', '.join(fields)} WHERE id = :id RETURNING id, name, code, description, max_tenants, max_residents, features, monthly_price, status, created_at"
        try:
            result = db.execute(text(sql), params)
            row = result.fetchone()
            db.commit()
            if row:
                return {
                    "id": row[0],
                    "name": row[1],
                    "code": row[2],
                    "description": row[3],
                    "max_tenants": row[4],
                    "max_residents": row[5],
                    "features": row[6],
                    "monthly_price": float(row[7]),
                    "status": row[8],
                    "created_at": row[9].isoformat() if row[9] else None,
                }
        except Exception:
            db.rollback()
            raise

        return self.get_plan_detail(plan_id, db)

    def deactivate_plan(self, plan_id: int, deactivated_by: int, db) -> dict:
        db.execute(
            text("UPDATE subscription_plans SET status = false WHERE id = :id"),
            {"id": plan_id},
        )
        db.commit()
        return self.get_plan_detail(plan_id, db)

    def get_plan_detail(self, plan_id: int, db) -> dict:
        result = db.execute(
            text(
                "SELECT sp.id, sp.name, sp.code, sp.description, sp.max_tenants, sp.max_residents, "
                "sp.features, sp.monthly_price, sp.status, sp.created_at, "
                "COUNT(DISTINCT t.id) as active_tenants "
                "FROM subscription_plans sp LEFT JOIN tenants t ON sp.id = t.plan_id AND t.is_active = true "
                "WHERE sp.id = :id GROUP BY sp.id"
            ),
            {"id": plan_id},
        )
        row = result.fetchone()
        if not row:
            raise RuntimeError(f"Plan {plan_id} not found")
        return {
            "id": row[0],
            "name": row[1],
            "code": row[2],
            "description": row[3],
            "max_tenants": row[4],
            "max_residents": row[5],
            "features": row[6],
            "monthly_price": float(row[7]),
            "status": row[8],
            "active_tenants": row[9],
            "created_at": row[10].isoformat() if row[10] else None,
        }
