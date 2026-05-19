from dataclasses import dataclass
from typing import Optional
from sqlalchemy import text
from sqlalchemy.orm import Session


@dataclass
class TowerRecord:
    id: int
    tenant_id: int
    name: str
    code: str
    floor_count: int
    created_at: Optional[str]


@dataclass
class UnitRecord:
    id: int
    tenant_id: int
    tower_id: Optional[int]
    tower_name: Optional[str]
    unit_type_id: Optional[int]
    unit_type_name: Optional[str]
    name_code: str
    coefficient: float
    area: Optional[float]
    created_at: Optional[str]


class UnitRepository:
    """Repository for tower and unit operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_towers(self, tenant_id: int) -> list[dict]:
        result = self.db.execute(
            text("SELECT id, tenant_id, name, code, floor_count, created_at FROM towers WHERE tenant_id = :tid"),
            {"tid": tenant_id},
        )
        return [{"id": r[0], "tenant_id": r[1], "name": r[2], "code": r[3], "floor_count": r[4], "created_at": r[5]} for r in result.fetchall()]

    def get_tower_detail(self, tenant_id: int, tower_id: int) -> Optional[dict]:
        result = self.db.execute(
            text("SELECT id, tenant_id, name, code, floor_count, created_at FROM towers WHERE id = :tid AND tenant_id = :tenant"),
            {"tid": tower_id, "tenant": tenant_id},
        )
        row = result.fetchone()
        if not row:
            return None
        return {"id": row[0], "tenant_id": row[1], "name": row[2], "code": row[3], "floor_count": row[4], "created_at": row[5]}

    def create_tower(self, tenant_id: int, name: str, code: str, floor_count: int) -> dict:
        result = self.db.execute(
            text("INSERT INTO towers (tenant_id, name, code, floor_count) VALUES (:tid, :name, :code, :fc) RETURNING id, tenant_id, name, code, floor_count"),
            {"tid": tenant_id, "name": name, "code": code, "fc": floor_count},
        )
        row = result.fetchone()
        return {"id": row[0], "tenant_id": row[1], "name": row[2], "code": row[3], "floor_count": row[4]}

    def get_units(self, tenant_id: int) -> list[dict]:
        result = self.db.execute(
            text("""
                SELECT u.id, u.tenant_id, u.tower_id, t.name as tower_name,
                       u.unit_type_id, ut.name as unit_type_name,
                       u.name_code, u.coefficient, u.area, u.created_at
                FROM habitational_units u
                LEFT JOIN towers t ON u.tower_id = t.id
                LEFT JOIN unit_types ut ON u.unit_type_id = ut.id
                WHERE u.tenant_id = :tid
            """),
            {"tid": tenant_id},
        )
        return [
            {"id": r[0], "tenant_id": r[1], "tower_id": r[2], "tower_name": r[3],
             "unit_type_id": r[4], "unit_type_name": r[5], "name_code": r[6],
             "coefficient": float(r[7]), "area": float(r[8]) if r[8] else None,
             "created_at": r[9]}
            for r in result.fetchall()
        ]

    def get_unit_detail(self, tenant_id: int, unit_id: int) -> Optional[dict]:
        result = self.db.execute(
            text("""
                SELECT u.id, u.tenant_id, u.tower_id, t.name as tower_name,
                       u.unit_type_id, ut.name as unit_type_name,
                       u.name_code, u.coefficient, u.area, u.created_at
                FROM habitational_units u
                LEFT JOIN towers t ON u.tower_id = t.id
                LEFT JOIN unit_types ut ON u.unit_type_id = ut.id
                WHERE u.id = :uid AND u.tenant_id = :tid
            """),
            {"uid": unit_id, "tid": tenant_id},
        )
        row = result.fetchone()
        if not row:
            return None
        return {
            "id": row[0], "tenant_id": row[1], "tower_id": row[2], "tower_name": row[3],
            "unit_type_id": row[4], "unit_type_name": row[5], "name_code": row[6],
            "coefficient": float(row[7]), "area": float(row[8]) if row[8] else None,
            "created_at": row[9],
        }
