import bcrypt
from sqlalchemy import text
from typing import Optional

from app.core.entities import AdminCreateRequest


class AdminService:
    def __init__(self, settings):
        self.settings = settings

    def create_admin_user(self, request: AdminCreateRequest, created_by: int, db) -> dict:
        """Create a new admin user and assign them to a tenant."""
        from app.repositories.tenant_repository import TenantRepository
        from app.services.tenant_service import TenantService
        from app.config import get_settings
        from app.core.exceptions import TenantNotFoundError

        # Check if email already exists
        result = db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": request.email},
        )
        if result.fetchone():
            raise ValueError("Email already registered")

        # Verify tenant exists
        tenant_repo = TenantRepository(db)
        tenant = tenant_repo.find_by_id(request.tenant_id)
        if not tenant:
            raise TenantNotFoundError(request.tenant_id)

        # Create user
        password_hash = bcrypt.hashpw(request.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        result = db.execute(
            text("INSERT INTO users (email, password_hash, name, phone, id_number, is_active) "
                 "VALUES (:email, :hash, :name, :phone, :id_number, true) RETURNING id, email, name, is_active, created_at"),
            {
                "email": request.email,
                "hash": password_hash,
                "name": request.name,
                "phone": request.phone,
                "id_number": request.id_number,
            },
        )
        row = result.fetchone()
        user_id = row[0]

        # Assign admin to tenant
        tenant_service = TenantService(get_settings())
        success = tenant_service.assign_admin(request.tenant_id, user_id, created_by, db)
        if not success:
            db.rollback()
            raise RuntimeError("Failed to assign admin to tenant")

        db.commit()
        return {
            "user_id": user_id,
            "email": row[1],
            "name": row[2],
            "tenant_id": request.tenant_id,
            "role": "admin",
            "status": "created",
        }
