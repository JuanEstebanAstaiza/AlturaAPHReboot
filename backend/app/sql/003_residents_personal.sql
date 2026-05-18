-- DDL 003: Residents & Personal
-- Asistente de Propiedad Horizontal

-- Residents
CREATE TABLE residents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    tenant_id INTEGER REFERENCES tenants(id),
    type VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    id_number VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resident <-> Unit link
CREATE TABLE resident_unit_link (
    id SERIAL PRIMARY KEY,
    resident_id INTEGER REFERENCES residents(id),
    unit_id INTEGER REFERENCES habitational_units(id),
    parking_id INTEGER REFERENCES parking_units(id),
    start_date DATE NOT NULL,
    end_date DATE,
    is_primary BOOLEAN DEFAULT false
);

-- Personal Documents
CREATE TABLE personal_documents (
    id SERIAL PRIMARY KEY,
    resident_id INTEGER REFERENCES residents(id),
    type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    version INTEGER DEFAULT 1,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resident History (flexible with JSONB)
CREATE TABLE resident_history (
    id SERIAL PRIMARY KEY,
    resident_id INTEGER REFERENCES residents(id),
    event_type VARCHAR(50) NOT NULL,
    details JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_residents_user_id ON residents(user_id);
CREATE INDEX idx_residents_tenant_id ON residents(tenant_id);
CREATE INDEX idx_resident_unit_link_resident_id ON resident_unit_link(resident_id);
CREATE INDEX idx_resident_unit_link_unit_id ON resident_unit_link(unit_id);
CREATE INDEX idx_personal_docs_resident_id ON personal_documents(resident_id);
CREATE INDEX idx_resident_history_resident_id ON resident_history(resident_id);
