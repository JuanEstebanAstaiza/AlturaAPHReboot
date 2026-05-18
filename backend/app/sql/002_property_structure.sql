-- DDL 002: Property Structure
-- Asistente de Propiedad Horizontal

-- Unit Types (global, not per tenant)
CREATE TABLE unit_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Towers
CREATE TABLE towers (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    floor_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Habitational Units
CREATE TABLE habitational_units (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    tower_id INTEGER REFERENCES towers(id),
    unit_type_id INTEGER REFERENCES unit_types(id),
    name_code VARCHAR(50) NOT NULL,
    coefficient DECIMAL(6,4) NOT NULL,
    area DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name_code)
);

-- Parking Units
CREATE TABLE parking_units (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    name_code VARCHAR(50) NOT NULL,
    assigned_unit_id INTEGER REFERENCES habitational_units(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name_code)
);

-- Indexes
CREATE INDEX idx_towers_tenant_id ON towers(tenant_id);
CREATE INDEX idx_hab_units_tenant_id ON habitational_units(tenant_id);
CREATE INDEX idx_hab_units_tower_id ON habitational_units(tower_id);
CREATE INDEX idx_parking_tenant_id ON parking_units(tenant_id);
