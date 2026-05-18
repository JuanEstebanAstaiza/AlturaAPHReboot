class APHException(Exception):
    """Base exception for the application."""
    def __init__(self, message: str, code: str = "aph_error"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class AuthenticationError(APHException):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, "auth_error")


class AuthorizationError(APHException):
    def __init__(self, message: str = "Not authorized"):
        super().__init__(message, "authz_error")


class FeatureNotAvailableError(APHException):
    def __init__(self, feature: str, plan: str):
        super().__init__(
            f"Feature '{feature}' not available in plan '{plan}'",
            "feature_not_available",
        )
        self.feature = feature
        self.plan = plan


class TenantNotFoundError(APHException):
    def __init__(self, tenant_id: int):
        super().__init__(f"Tenant {tenant_id} not found", "tenant_not_found")
        self.tenant_id = tenant_id


class UserNotFoundError(APHException):
    def __init__(self, user_id: int | None = None, email: str | None = None):
        if user_id:
            super().__init__(f"User {user_id} not found", "user_not_found")
        elif email:
            super().__init__(f"User with email {email} not found", "user_not_found")
        else:
            super().__init__("User not found", "user_not_found")
        self.user_id = user_id
        self.email = email


class TenantLimitExceededError(APHException):
    def __init__(self, current: int, max_tenants: int):
        super().__init__(
            f"Tenant limit exceeded: {current} / {max_tenants}",
            "tenant_limit_exceeded",
        )
        self.current = current
        self.max_tenants = max_tenants


class PQRSError(APHException):
    def __init__(self, message: str):
        super().__init__(message, "pqrs_error")


class DocumentError(APHException):
    def __init__(self, message: str):
        super().__init__(message, "document_error")


class ReservationError(APHException):
    def __init__(self, message: str):
        super().__init__(message, "reservation_error")


class FinancialError(APHException):
    def __init__(self, message: str):
        super().__init__(message, "financial_error")
