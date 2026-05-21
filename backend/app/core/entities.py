from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum


# --- Enums for Pydantic ---

class UserRoleEnum(str, Enum):
    SUPERUSER = "superuser"
    ADMIN = "admin"
    COMITE = "comite"
    VIGILANCIA = "vigilancia"
    RESIDENT = "resident"


class SubscriptionStatusEnum(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    TRIAL = "trial"


class PQRSStatusEnum(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    ESCALATED = "escalated"
    CLOSED = "closed"


class PQRSPriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class PQRSTypeEnum(str, Enum):
    PETICION = "p"
    QUEJA = "q"
    SUGERENCIA = "r"
    RECLAMO = "s"


class DocumentAccessLevelEnum(str, Enum):
    PUBLIC = "public"
    ADMIN = "admin"
    RESTRICTED = "restricted"


class ReservationStatusEnum(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


# --- Auth Schemas ---

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    role: UserRoleEnum
    name: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=1)
    phone: Optional[str] = None
    id_number: Optional[str] = None


class TenantSelectRequest(BaseModel):
    tenant_id: int


class TenantInfo(BaseModel):
    tenant_id: int
    tenant_name: str
    plan: str
    features: dict
    subscription_status: SubscriptionStatusEnum
    total_units: int


class MyAccessInfo(BaseModel):
    tenant_id: int
    tenant_name: str
    unit_name: Optional[str] = None
    access_type: str


class FeatureBlockedResponse(BaseModel):
    error: str = "feature_not_available"
    feature: str
    tenant_plan: str
    available_features: list[str]
    upgrade_url: Optional[str] = None


# --- Tenant Schemas ---

class TenantCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    address: Optional[str] = None
    total_units: int = 0
    plan_id: int


class TenantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    total_units: Optional[int] = None
    subscription_status: Optional[SubscriptionStatusEnum] = None


class TenantDetail(BaseModel):
    id: int
    name: str
    address: Optional[str]
    total_units: int
    plan: str
    plan_name: str
    subscription_status: SubscriptionStatusEnum
    subscription_start: Optional[date]
    subscription_end: Optional[date]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class PlanAssignment(BaseModel):
    plan_id: int


class AdminAssignment(BaseModel):
    user_id: int


# --- Plan Schemas ---

class PlanCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    max_tenants: int = Field(..., ge=1)
    max_residents: int = Field(..., ge=1)
    features: dict = Field(..., min_length=1)
    monthly_price: float = Field(..., ge=0)


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_tenants: Optional[int] = None
    max_residents: Optional[int] = None
    features: Optional[dict] = None
    monthly_price: Optional[float] = None
    status: Optional[bool] = None


class PlanDetail(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str]
    max_tenants: int
    max_residents: int
    features: dict
    monthly_price: float
    status: bool
    active_tenants: int
    created_at: datetime


# --- Admin Creation Schema ---

class AdminCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=1)
    phone: Optional[str] = None
    id_number: Optional[str] = None
    tenant_id: int


# --- Superuser Schemas ---

class SuperuserDashboard(BaseModel):
    total_tenants: int
    active_tenants: int
    total_users: int
    total_revenue: float
    subscriptions_by_plan: dict


class AnalyticsUsage(BaseModel):
    tenant_id: int
    tenant_name: str
    pqrs_count: int
    documents_count: int
    reservations_count: int
    residents_count: int
    active_users_last_30d: int


class AuditLogEntry(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str]
    tenant_id: Optional[int]
    tenant_name: Optional[str]
    action: str
    resource: str
    resource_id: Optional[int]
    details: Optional[dict]
    ip_address: Optional[str]
    timestamp: datetime


# --- Resident Schemas ---

class ResidentProfile(BaseModel):
    id: int
    user_id: int
    tenant_id: int
    tenant_name: str
    type: str  # owner, tenant, temporary
    name: str
    id_number: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    created_at: datetime
    updated_at: datetime


class ResidentDirectoryEntry(BaseModel):
    id: int
    name: str
    type: str
    phone: Optional[str]
    email: Optional[str]
    units: list[str]
    access_type: str


class ResidentUnitLinkRequest(BaseModel):
    resident_id: int
    unit_id: int
    parking_id: Optional[int] = None
    start_date: date
    end_date: Optional[date] = None
    is_primary: bool = False


# --- Unit Schemas ---

class TowerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=1, max_length=20)
    floor_count: int = 0


class TowerDetail(BaseModel):
    id: int
    tenant_id: int
    name: str
    code: str
    floor_count: int
    created_at: datetime


class UnitDetail(BaseModel):
    id: int
    tenant_id: int
    tower_id: int
    tower_name: Optional[str]
    unit_type_id: int
    unit_type_name: Optional[str]
    name_code: str
    coefficient: float
    area: Optional[float]
    created_at: datetime
