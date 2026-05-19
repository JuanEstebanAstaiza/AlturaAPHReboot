from typing import Optional
from sqlalchemy import text
from app.config import Settings
from app.core.exceptions import TenantNotFoundError, UserNotFoundError
from app.repositories.resident_repository import ResidentRepository
from app.repositories.tenant_repository import TenantRepository
from app.repositories.user_repository import UserRepository


class ResidentService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def get_directory(self, tenant_id: int, db) -> list[dict]:
        res_repo = ResidentRepository(db)
        return res_repo.get_directory(tenant_id)

    def get_profile(self, user_id: int, db) -> dict:
        res_repo = ResidentRepository(db)
        resident = res_repo.find_by_user_id(user_id)
        if not resident:
            raise UserNotFoundError(user_id=user_id)
        tenant_repo = TenantRepository(db)
        tenant = tenant_repo.find_by_id(resident.tenant_id)
        return {
            "id": resident.id,
            "user_id": resident.user_id,
            "tenant_id": resident.tenant_id,
            "tenant_name": tenant.name if tenant else "Unknown",
            "type": resident.type,
            "name": resident.name,
            "id_number": resident.id_number,
            "phone": resident.phone,
            "email": resident.email,
        }

    def link_resident_to_unit(self, user_id: int, unit_id: int, start_date: str, is_primary: bool, db) -> dict:
        user_repo = UserRepository(db)
        user = user_repo.find_by_id(user_id)
        if not user:
            raise UserNotFoundError(user_id=user_id)

        # Check unit exists
        res_repo = ResidentRepository(db)
        # Get tenant from unit
        result = db.execute(text("SELECT tenant_id FROM habitational_units WHERE id = :uid"), {"uid": unit_id})
        row = result.fetchone()
        if not row:
            raise Exception(f"Unit {unit_id} not found")
        tenant_id = row[0]

        # Check user is resident of this tenant
        resident = res_repo.find_by_user_id(user_id)
        if not resident:
            # Create resident record
            resident = res_repo.create(user_id, tenant_id, "owner", user.name, user.id_number, user.phone, user.email)
        elif resident.tenant_id != tenant_id:
            raise Exception(f"User {user_id} is not a resident of tenant {tenant_id}")

        success = res_repo.link_to_unit(resident.id, unit_id, None, start_date, is_primary)
        if not success:
            raise Exception("Failed to link resident to unit")

        return {
            "resident_id": resident.id,
            "unit_id": unit_id,
            "start_date": start_date,
            "is_primary": is_primary,
        }

    def unlink_resident_from_unit(self, user_id: int, unit_id: int, db) -> bool:
        user_repo = UserRepository(db)
        user = user_repo.find_by_id(user_id)
        if not user:
            raise UserNotFoundError(user_id=user_id)

        res_repo = ResidentRepository(db)
        resident = res_repo.find_by_user_id(user_id)
        if not resident:
            raise UserNotFoundError(user_id=user_id)

        return res_repo.unlink_from_unit(resident.id, unit_id)

    def get_my_access(self, user_id: int, db) -> list[dict]:
        user_repo = UserRepository(db)
        accesses = user_repo.get_user_tenant_access(user_id)
        tenant_repo = TenantRepository(db)
        res_repo = ResidentRepository(db)
        result = []

        for acc in accesses:
            tenant = tenant_repo.find_by_id(acc.tenant_id)
            if tenant:
                units = res_repo.get_resident_units(acc.user_id)
                unit_names = [u["unit_name"] for u in units if u["tenant_name"] == tenant.name]
                result.append({
                    "tenant_id": acc.tenant_id,
                    "tenant_name": tenant.name,
                    "unit_name": unit_names[0] if unit_names else None,
                    "access_type": acc.access_type,
                })

        return result
