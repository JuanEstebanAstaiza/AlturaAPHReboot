-- DDL 001: Core Multi-Tenant + Auth
-- Asistente de Propiedad Horizontal

-- Enums
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled', 'trial');
CREATE TYPE user_role AS ENUM ('superuser', 'admin', 'comite', 'vigilancia', 'resident');
CREATE TYPE pqrs_type AS ENUM ('p', 'q', 'r', 's');
CREATE TYPE pqrs_status AS ENUM ('open', 'in_progress', 'escalated', 'closed');
CREATE TYPE pqrs_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE document_access_level AS ENUM ('public', 'admin', 'restricted');
CREATE TYPE reservation_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed');
CREATE TYPE contract_status AS ENUM ('active', 'expiring', 'expired', 'terminated');
CREATE TYPE infraction_status AS ENUM ('reported', 'investigating', 'resolved', 'sanctioned');
CREATE TYPE visitor_status AS ENUM ('on_site', 'departed', 'authorized');
CREATE TYPE assembly_type AS ENUM ('ordinary', 'extraordinary');
CREATE TYPE assembly_status AS ENUM ('convoked', 'in_session', 'completed', 'cancelled');
CREATE TYPE commitment_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue');

-- Subscription Plans
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    max_tenants INTEGER NOT NULL,
    max_residents INTEGER NOT NULL DEFAULT 10,
    features JSONB NOT NULL,
    monthly_price DECIMAL(12,2) NOT NULL,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenants (Copropiedades/Condominios)
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    total_units INTEGER DEFAULT 0,
    plan_id INTEGER REFERENCES subscription_plans(id),
    subscription_status subscription_status DEFAULT 'trial',
    subscription_start DATE,
    subscription_end DATE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Users (all types share same table)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    id_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Permissions
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    feature_flag VARCHAR(50)
);

-- Role -> Permission mapping
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id),
    permission_id INTEGER REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

-- User -> Role mapping
CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- Admin <-> Tenant relationship
CREATE TABLE tenant_admins (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    user_id INTEGER REFERENCES users(id),
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    UNIQUE(tenant_id, user_id)
);

-- User <-> Tenant access (residents/owners with multiple properties)
CREATE TABLE user_tenant_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    tenant_id INTEGER REFERENCES tenants(id),
    access_type VARCHAR(20) NOT NULL,
    granted_by INTEGER REFERENCES tenant_admins(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    valid_from DATE,
    valid_to DATE,
    UNIQUE(user_id, tenant_id)
);

-- Audit Logs (global, cross-tenant for superuser)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    tenant_id INTEGER REFERENCES tenants(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id INTEGER,
    details JSONB,
    ip_address INET,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tenants_plan_id ON tenants(plan_id);
CREATE INDEX idx_tenants_subscription_status ON tenants(subscription_status);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_tenant_admins_tenant_id ON tenant_admins(tenant_id);
CREATE INDEX idx_tenant_admins_user_id ON tenant_admins(user_id);
CREATE INDEX idx_user_tenant_access_user_id ON user_tenant_access(user_id);
CREATE INDEX idx_user_tenant_access_tenant_id ON user_tenant_access(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
