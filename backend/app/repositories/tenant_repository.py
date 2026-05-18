from dataclasses import dataclass
from typing import Optional
from sqlalchemy.orm import Session


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
    """Repository for tenant operations. MVP placeholder."""

    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, tenant_id: int) -> Optional[TenantRecord]:
        """Find tenant by ID."""
        # TODO: query tenants table
        # MVP placeholder
        mock_tenants = {
            1: TenantRecord(
                id=1, name="Conjunto Altah", address="Calle 45 #12-34, Bogotá",
                total_units=120, plan_id=3, subscription_status="active",
                subscription_start="2026-01-01", subscription_end="2027-01-01", is_active=True,
            ),
            2: TenantRecord(
                id=2, name="Torres del Parque", address="Avenida 68 #5-20, Bogotá",
                total_units=45, plan_id=2, subscription_status="active",
                subscription_start="2026-03-01", subscription_end="2027-03-01", is_active=True,
            ),
        }
        return mock_tenants.get(tenant_id)

    def list_all(self) -> list[TenantRecord]:
        """List all active tenants."""
        # TODO: query tenants table
        return [
            TenantRecord(
                id=1, name="Conjunto Altah", address="Calle 45 #12-34, Bogotá",
                total_units=120, plan_id=3, subscription_status="active",
                subscription_start="2026-01-01", subscription_end="2027-01-01", is_active=True,
            ),
            TenantRecord(
                id=2, name="Torres del Parque", address="Avenida 68 #5-20, Bogotá",
                total_units=45, plan_id=2, subscription_status="active",
                subscription_start="2026-03-01", subscription_end="2027-03-01", is_active=True,
            ),
        ]
