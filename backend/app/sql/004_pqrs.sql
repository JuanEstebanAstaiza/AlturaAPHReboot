-- MVP-3: PQRS Module DDL

-- PQRS Tickets
CREATE TABLE pqrs_tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    tenant_id INTEGER REFERENCES tenants(id),
    type pqrs_type NOT NULL,
    status pqrs_status DEFAULT 'open',
    priority pqrs_priority DEFAULT 'medium',
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- PQRS Attachments (separate table — better than JSONB in comments)
CREATE TABLE pqrs_attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES pqrs_tickets(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- PQRS Comments
CREATE TABLE pqrs_comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES pqrs_tickets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PQRS Categories (auto-routing + escalation)
CREATE TABLE pqrs_categories (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    pqrs_type pqrs_type NOT NULL,
    default_assigned_user_id INTEGER REFERENCES users(id),
    escalation_timeout_hours INTEGER DEFAULT 48,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pqrs_tickets_tenant_id ON pqrs_tickets(tenant_id);
CREATE INDEX idx_pqrs_tickets_status ON pqrs_tickets(status);
CREATE INDEX idx_pqrs_tickets_type ON pqrs_tickets(type);
CREATE INDEX idx_pqrs_tickets_assigned_to ON pqrs_tickets(assigned_to);
CREATE INDEX idx_pqrs_tickets_created_at ON pqrs_tickets(created_at);
CREATE INDEX idx_pqrs_comments_ticket_id ON pqrs_comments(ticket_id);
CREATE INDEX idx_pqrs_attachments_ticket_id ON pqrs_attachments(ticket_id);
CREATE INDEX idx_pqrs_categories_tenant_id ON pqrs_categories(tenant_id);
