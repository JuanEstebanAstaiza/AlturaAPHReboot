from dataclasses import dataclass
from typing import Optional
from sqlalchemy.orm import Session


@dataclass
class UserRecord:
    id: int
    email: str
    password_hash: str
    name: str
    phone: Optional[str]
    id_number: Optional[str]
    is_active: bool


class UserRepository:
    """Repository for user operations. MVP placeholder with mock data."""

    def __init__(self, db: Session):
        self.db = db

    def find_by_email(self, email: str) -> Optional[UserRecord]:
        """Find user by email."""
        # TODO: query users table
        # MVP placeholder with mock data for testing
        mock_users = {
            "super@aph.com": UserRecord(
                id=1, email="super@aph.com", password_hash="$2b$12$LQ3rKw5VfJ8YnXzKp1qG2eR7tM9sN0oP4aB6cD8dF0gH2jK4lM6nO",
                name="Superusuario", phone="+57 300 123 4567", id_number="000000", is_active=True,
            ),
            "admin@altah.com": UserRecord(
                id=2, email="admin@altah.com", password_hash="$2b$12$Xz8Kw2VfJ5YnXzKp1qG2eR7tM9sN0oP4aB6cD8dF0gH2jK4lM6nO",
                name="Carlos Admin", phone="+57 310 234 5678", id_number="12345678", is_active=True,
            ),
            "resident@altah.com": UserRecord(
                id=3, email="resident@altah.com", password_hash="$2b$12$Ab3Kw9VfJ2YnXzKp1qG2eR7tM9sN0oP4aB6cD8dF0gH2jK4lM6nO",
                name="Maria Residente", phone="+57 320 345 6789", id_number="87654321", is_active=True,
            ),
        }
        return mock_users.get(email)

    def find_by_id(self, user_id: int) -> Optional[UserRecord]:
        """Find user by ID."""
        # TODO: query users table
        return None

    def get_user_role(self, user_id: int) -> str:
        """Get user's role."""
        # TODO: query user_roles table
        role_map = {1: "superuser", 2: "admin", 3: "resident"}
        return role_map.get(user_id, "resident")
