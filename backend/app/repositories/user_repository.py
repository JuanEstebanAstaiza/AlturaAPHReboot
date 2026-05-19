from dataclasses import dataclass
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text


@dataclass
class UserRecord:
    id: int
    email: str
    password_hash: str
    name: str
    phone: Optional[str]
    id_number: Optional[str]
    is_active: bool


@dataclass
class UserRoleRecord:
    user_id: int
    role_name: str


@dataclass
class TenantAdminRecord:
    id: int
    tenant_id: int
    user_id: int
    assigned_by: int
    status: str


@dataclass
class UserTenantAccessRecord:
    id: int
    user_id: int
    tenant_id: int
    access_type: str
    granted_by: Optional[int]


class UserRepository:
    """Repository for user operations with real DB queries."""

    def __init__(self, db: Session):
        self.db = db

    def find_by_email(self, email: str) -> Optional[UserRecord]:
        result = self.db.execute(
            text("SELECT id, email, password_hash, name, phone, id_number, is_active FROM users WHERE email = :email"),
            {"email": email},
        )
        row = result.fetchone()
        if not row:
            return None
        return UserRecord(
            id=row[0], email=row[1], password_hash=row[2], name=row[3],
            phone=row[4], id_number=row[5], is_active=row[6],
        )

    def find_by_id(self, user_id: int) -> Optional[UserRecord]:
        result = self.db.execute(
            text("SELECT id, email, password_hash, name, phone, id_number, is_active FROM users WHERE id = :id"),
            {"id": user_id},
        )
        row = result.fetchone()
        if not row:
            return None
        return UserRecord(
            id=row[0], email=row[1], password_hash=row[2], name=row[3],
            phone=row[4], id_number=row[5], is_active=row[6],
        )

    def create(self, email: str, password_hash: str, name: str, phone: Optional[str] = None, id_number: Optional[str] = None) -> UserRecord:
        result = self.db.execute(
            text("INSERT INTO users (email, password_hash, name, phone, id_number, is_active) VALUES (:email, :password_hash, :name, :phone, :id_number, true) RETURNING id, email, password_hash, name, phone, id_number, is_active"),
            {"email": email, "password_hash": password_hash, "name": name, "phone": phone, "id_number": id_number},
        )
        row = result.fetchone()
        return UserRecord(
            id=row[0], email=row[1], password_hash=row[2], name=row[3],
            phone=row[4], id_number=row[5], is_active=row[6],
        )

    def get_user_role(self, user_id: int) -> str:
        result = self.db.execute(
            text("SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = :id"),
            {"id": user_id},
        )
        row = result.fetchone()
        return row[0] if row else "resident"

    def get_user_roles(self, user_id: int) -> list[str]:
        result = self.db.execute(
            text("SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = :id"),
            {"id": user_id},
        )
        return [r[0] for r in result.fetchall()]

    def get_admin_tenants(self, user_id: int) -> list[int]:
        result = self.db.execute(
            text("SELECT tenant_id FROM tenant_admins WHERE user_id = :id AND status = 'active'"),
            {"id": user_id},
        )
        return [r[0] for r in result.fetchall()]

    def get_user_tenant_access(self, user_id: int) -> list[UserTenantAccessRecord]:
        result = self.db.execute(
            text("SELECT id, user_id, tenant_id, access_type, granted_by FROM user_tenant_access WHERE user_id = :id"),
            {"id": user_id},
        )
        return [
            UserTenantAccessRecord(id=r[0], user_id=r[1], tenant_id=r[2], access_type=r[3], granted_by=r[4])
            for r in result.fetchall()
        ]

    def get_tenant_users(self, tenant_id: int) -> list[dict]:
        # Admins of the tenant
        result = self.db.execute(
            text("""
                SELECT u.id, u.email, u.name, 'admin' as role
                FROM users u JOIN tenant_admins ta ON u.id = ta.user_id
                WHERE ta.tenant_id = :tid AND ta.status = 'active'
            """),
            {"tid": tenant_id},
        )
        admins = [{"user_id": r[0], "email": r[1], "name": r[2], "role": r[3]} for r in result.fetchall()]

        # Residents with access
        result = self.db.execute(
            text("""
                SELECT u.id, u.email, u.name, uta.access_type
                FROM users u JOIN user_tenant_access uta ON u.id = uta.user_id
                WHERE uta.tenant_id = :tid
            """),
            {"tid": tenant_id},
        )
        residents = [{"user_id": r[0], "email": r[1], "name": r[2], "role": "resident", "access_type": r[3]} for r in result.fetchall()]

        return admins + residents

    def count_current_tenants(self, user_id: int) -> int:
        result = self.db.execute(
            text("SELECT COUNT(*) FROM tenant_admins WHERE user_id = :id AND status = 'active'"),
            {"id": user_id},
        )
        return result.fetchone()[0]

    def assign_admin(self, tenant_id: int, user_id: int, assigned_by: int) -> bool:
        try:
            self.db.execute(
                text("INSERT INTO tenant_admins (tenant_id, user_id, assigned_by) VALUES (:tid, :uid, :ab)"),
                {"tid": tenant_id, "uid": user_id, "ab": assigned_by},
            )
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            return False
