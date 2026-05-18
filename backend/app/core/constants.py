# Enums for the application

class SubscriptionStatus:
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    TRIAL = "trial"


class UserRole:
    SUPERUSER = "superuser"
    ADMIN = "admin"
    COMITE = "comite"
    VIGILANCIA = "vigilancia"
    RESIDENT = "resident"


class PQRSType:
    PETICION = "p"
    QUEJA = "q"
    SUGERENCIA = "r"
    RECLAMO = "s"


class PQRSStatus:
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    ESCALATED = "escalated"
    CLOSED = "closed"


class PQRSPriority:
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class DocumentAccessLevel:
    PUBLIC = "public"
    ADMIN = "admin"
    RESTRICTED = "restricted"


class ReservationStatus:
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class ContractStatus:
    ACTIVE = "active"
    EXPIRING = "expiring"
    EXPIRED = "expired"
    TERMINATED = "terminated"


class InfractionStatus:
    REPORTED = "reported"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    SANCTIONED = "sanctioned"


class VisitorStatus:
    ON_SITE = "on_site"
    DEPARTED = "departed"
    AUTHORIZED = "authorized"


class AssemblyType:
    ORDINARY = "ordinary"
    EXTRAORDINARY = "extraordinary"


class AssemblyStatus:
    CONVOKED = "convoked"
    IN_SESSION = "in_session"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class CommitmentStatus:
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"


# Feature flags
FEATURES = {
    "pqrs": "Módulo PQR (Atención y Comunicación)",
    "documents": "Módulo Gestión Documental",
    "reservations": "Módulo Reservas de Áreas Comunes",
    "financial": "Módulo Gestión Financiera y Contable",
    "assemblies": "Módulo Asambleas, Consejo y Decisiones",
    "convivencia": "Módulo Convivencia y Régimen Sancionatorio",
    "access": "Módulo Control de Acceso y Seguridad",
    "resident_portal": "Portal de Residente",
    "admin_dashboard": "Dashboard de Administrador",
    "superuser_access": "Acceso Superuser",
}

# Subscription plans
SUBSCRIPTION_PLANS = {
    "free": {
        "max_tenants": 1,
        "features": {"pqrs": True, "documents": True, "resident_portal": True, "admin_dashboard": True},
        "monthly_price": 0,
    },
    "basic": {
        "max_tenants": 3,
        "features": {"pqrs": True, "documents": True, "resident_portal": True, "reservations": True, "admin_dashboard": True},
        "monthly_price": 50000,
    },
    "professional": {
        "max_tenants": 10,
        "features": {
            "pqrs": True, "documents": True, "resident_portal": True, "reservations": True,
            "assemblies": True, "convivencia": True, "admin_dashboard": True,
        },
        "monthly_price": 150000,
    },
    "enterprise": {
        "max_tenants": 999999,
        "features": {
            "pqrs": True, "documents": True, "resident_portal": True, "reservations": True,
            "assemblies": True, "convivencia": True, "financial": True, "access": True,
            "admin_dashboard": True, "superuser_access": True,
        },
        "monthly_price": 500000,
    },
}

# Default permissions per role
DEFAULT_ROLE_PERMISSIONS = {
    "superuser": list(FEATURES.keys()),
    "admin": ["pqrs", "documents", "reservations", "assemblies", "convivencia", "access", "admin_dashboard", "resident_portal"],
    "comite": ["pqrs", "documents", "convivencia", "assemblies"],
    "vigilancia": ["access", "documents"],
    "resident": ["pqrs", "documents", "reservations", "resident_portal"],
}
