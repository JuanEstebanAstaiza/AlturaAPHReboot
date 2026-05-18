from app.core.constants import DEFAULT_ROLE_PERMISSIONS, FEATURES


class RBACService:
    def __init__(self):
        self.role_permissions = DEFAULT_ROLE_PERMISSIONS
        self.features = FEATURES

    def get_role_permissions(self, role: str) -> list[str]:
        """Get feature permissions for a role."""
        return self.role_permissions.get(role, [])

    def has_feature(self, role: str, feature: str) -> bool:
        """Check if a role has access to a feature."""
        permissions = self.get_role_permissions(role)
        return feature in permissions

    def get_feature_description(self, feature: str) -> str:
        """Get human-readable description of a feature."""
        return self.features.get(feature, "Unknown feature")

    def validate_admin_tenant_access(self, user_id: int, tenant_id: int) -> bool:
        """Check if an admin is assigned to a specific tenant."""
        # TODO: query tenant_admins table
        return True  # MVP placeholder

    def validate_resident_tenant_access(self, user_id: int, tenant_id: int) -> bool:
        """Check if a resident has access to a specific tenant."""
        # TODO: query user_tenant_access table
        return True  # MVP placeholder

    def check_feature_access(self, role: str, tenant_plan: str, feature: str) -> bool:
        """Check if a feature is accessible given role and tenant plan."""
        if role == "superuser":
            return True

        if not self.has_feature(role, feature):
            return False

        from app.services.tenant_service import TenantService
        tenant_service = TenantService(None)  # TODO: pass settings
        return tenant_service.validate_plan_features(tenant_plan, feature)
