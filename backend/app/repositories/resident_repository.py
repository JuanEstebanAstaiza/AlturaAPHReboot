from dataclasses import dataclass
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text


@dataclass
class ResidentRecord:
    id: int
    user_id: int
    tenant_id: int
    type: str
    name: str
    id_number: Optional[str]
    phone: Optional[str]
    email: Optional[str]


@dataclass
class ResidentUnitLinkRecord:
    id: int
    resident_id: int
    unit_id: int
    parking_id: Optional[int]
    start_date: str
    is_primary: bool


@dataclass
class UnitRecord:
    id: int
    tenant_id: int
    tower_id: int
    tower_name: Optional[str]
    unit_type_id: int
    unit_type_name: Optional[str]
    name_code: str
    coefficient: float
    area: Optional[float]


class ResidentRepository:
    """Repository for resident operations with real DB queries."""

    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, resident_id: int) -> Optional[ResidentRecord]:
        result = self.db.execute(
            text("SELECT id, user_id, tenant_id, type, name, id_number, phone, email FROM residents WHERE id = :id"),
            {"id": resident_id},
        )
        row = result.fetchone()
        if not row:
            return None
        return ResidentRecord(
            id=row[0], user_id=row[1], tenant_id=row[2], type=row[3],
            name=row[4], id_number=row[5], phone=row[6], email=row[7],
        )

    def find_by_user_id(self, user_id: int) -> Optional[ResidentRecord]:
        result = self.db.execute(
            text("SELECT id, user_id, tenant_id, type, name, id_number, phone, email FROM residents WHERE user_id = :id"),
            {"id": user_id},
        )
        row = result.fetchone()
        if not row:
            return None
        return ResidentRecord(
            id=row[0], user_id=row[1], tenant_id=row[2], type=row[3],
            name=row[4], id_number=row[5], phone=row[6], email=row[7],
        )

    def create(self, user_id: int, tenant_id: int, resident_type: str, name: str,
               id_number: Optional[str] = None, phone: Optional[str] = None, email: Optional[str] = None) -> ResidentRecord:
        result = self.db.execute(
            text("INSERT INTO residents (user_id, tenant_id, type, name, id_number, phone, email) VALUES (:uid, :tid, :type, :name, :id_number, :phone, :email) RETURNING id, user_id, tenant_id, type, name, id_number, phone, email"),
            {"uid": user_id, "tid": tenant_id, "type": resident_type, "name": name, "id_number": id_number, "phone": phone, "email": email},
        )
        row = result.fetchone()
        return ResidentRecord(
            id=row[0], user_id=row[1], tenant_id=row[2], type=row[3],
            name=row[4], id_number=row[5], phone=row[6], email=row[7],
        )

    def get_directory(self, tenant_id: int) -> list[dict]:
        result = self.db.execute(
            text("""
                SELECT r.id, r.name, r.type, r.phone, r.email,
                       STRING_AGG(hu.name_code, ', ') as units,
                       uta.access_type
                FROM residents r
                LEFT JOIN resident_unit_link rul ON r.id = rul.resident_id
                LEFT JOIN habitational_units hu ON rul.unit_id = hu.id
                LEFT JOIN user_tenant_access uta ON r.user_id = uta.user_id AND r.tenant_id = uta.tenant_id
                WHERE r.tenant_id = :tid
                GROUP BY r.id, r.name, r.type, r.phone, r.email, uta.access_type
            """),
            {"tid": tenant_id},
        )
        return [
            {
                "id": r[0], "name": r[1], "type": r[2], "phone": r[3],
                "email": r[4], "units": r[5].split(",") if r[5] else [],
                "access_type": r[6],
            }
            for r in result.fetchall()
        ]

    def get_resident_units(self, resident_id: int) -> list[dict]:
        result = self.db.execute(
            text("""
                SELECT hu.id, hu.name_code, t.name as tenant_name
                FROM resident_unit_link rul
                JOIN habitational_units hu ON rul.unit_id = hu.id
                JOIN tenants t ON hu.tenant_id = t.id
                WHERE rul.resident_id = :rid
            """),
            {"rid": resident_id},
        )
        return [{"unit_id": r[0], "unit_name": r[1], "tenant_name": r[2]} for r in result.fetchall()]

    def link_to_unit(self, resident_id: int, unit_id: int, parking_id: Optional[int], start_date: str, is_primary: bool) -> bool:
        try:
            self.db.execute(
                text("INSERT INTO resident_unit_link (resident_id, unit_id, parking_id, start_date, is_primary) VALUES (:rid, :uid, :pid, :sd, :ip)"),
                {"rid": resident_id, "uid": unit_id, "pid": parking_id, "sd": start_date, "ip": is_primary},
            )
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            return False

    def unlink_from_unit(self, resident_id: int, unit_id: int) -> bool:
        try:
            self.db.execute(
                text("DELETE FROM resident_unit_link WHERE resident_id = :rid AND unit_id = :uid"),
                {"rid": resident_id, "uid": unit_id},
            )
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            return False

    def count_by_tenant(self, tenant_id: int) -> int:
        result = self.db.execute(
            text("SELECT COUNT(*) FROM residents WHERE tenant_id = :tid"),
            {"tid": tenant_id},
        )
        return result.fetchone()[0]


class UnitRepository:
    """Repository for unit/tower operations with real DB queries."""

    def __init__(self, db: Session):
        self.db = db

    def get_towers(self, tenant_id: int) -> list[dict]:
        result = self.db.execute(
            text("SELECT id, tenant_id, name, code, floor_count, created_at FROM towers WHERE tenant_id = :tid ORDER BY name"),
            {"tid": tenant_id},
        )
        return [{"id": r[0], "tenant_id": r[1], "name": r[2], "code": r[3], "floor_count": r[4], "created_at": r[5]} for r in result.fetchall()]

    def get_tower_detail(self, tenant_id: int, tower_id: int) -> Optional[dict]:
        result = self.db.execute(
            text("SELECT id, tenant_id, name, code, floor_count, created_at FROM towers WHERE id = :tid AND tenant_id = :ttid"),
            {"tid": tower_id, "ttid": tenant_id},
        )
        row = result.fetchone()
        if not row:
            return None
        return {"id": row[0], "tenant_id": row[1], "name": row[2], "code": row[3], "floor_count": row[4], "created_at": row[5]}

    def create_tower(self, tenant_id: int, name: str, code: str, floor_count: int) -> dict:
        result = self.db.execute(
            text("INSERT INTO towers (tenant_id, name, code, floor_count) VALUES (:tid, :name, :code, :fc) RETURNING id, tenant_id, name, code, floor_count, created_at"),
            {"tid": tenant_id, "name": name, "code": code, "fc": floor_count},
        )
        row = result.fetchone()
        return {"id": row[0], "tenant_id": row[1], "name": row[2], "code": row[3], "floor_count": row[4], "created_at": row[5]}

    def get_units(self, tenant_id: int) -> list[dict]:
        result = self.db.execute(
            text("""
                SELECT hu.id, hu.tenant_id, hu.tower_id, t.name as tower_name,
                       hu.unit_type_id, ut.name as unit_type_name,
                       hu.name_code, hu.coefficient, hu.area, hu.created_at
                FROM habitational_units hu
                LEFT JOIN towers t ON hu.tower_id = t.id
                LEFT JOIN unit_types ut ON hu.unit_type_id = ut.id
                WHERE hu.tenant_id = :tid
            """),
            {"tid": tenant_id},
        )
        return [
            {
                "id": r[0], "tenant_id": r[1], "tower_id": r[2], "tower_name": r[3],
                "unit_type_id": r[4], "unit_type_name": r[5], "name_code": r[6],
                "coefficient": float(r[7]) if r[7] else 0, "area": float(r[8]) if r[8] else None,
                "created_at": r[9],
            }
            for r in result.fetchall()
        ]

    def get_unit_detail(self, tenant_id: int, unit_id: int) -> Optional[dict]:
        result = self.db.execute(
            text("""
                SELECT hu.id, hu.tenant_id, hu.tower_id, t.name as tower_name,
                       hu.unit_type_id, ut.name as unit_type_name,
                       hu.name_code, hu.coefficient, hu.area, hu.created_at
                FROM habitational_units hu
                LEFT JOIN towers t ON hu.tower_id = t.id
                LEFT JOIN unit_types ut ON hu.unit_type_id = ut.id
                WHERE hu.id = :uid AND hu.tenant_id = :tid
            """),
            {"uid": unit_id, "tid": tenant_id},
        )
        row = result.fetchone()
        if not row:
            return None
        return {
            "id": row[0], "tenant_id": row[1], "tower_id": row[2], "tower_name": row[3],
            "unit_type_id": row[4], "unit_type_name": row[5], "name_code": row[6],
            "coefficient": float(row[7]) if row[7] else 0, "area": float(row[8]) if row[8] else None,
            "created_at": row[9],
        }

    def get_unit_type_list(self) -> list[dict]:
        result = self.db.execute(
            text("SELECT id, name, description FROM unit_types"),
        )
        return [{"id": r[0], "name": r[1], "description": r[2]} for r in result.fetchall()]

    def count_by_tenant(self, tenant_id: int) -> int:
        result = self.db.execute(
            text("SELECT COUNT(*) FROM habitational_units WHERE tenant_id = :tid"),
            {"tid": tenant_id},
        )
        return result.fetchone()[0]
