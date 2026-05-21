-- DDL 011: Seed Data
-- Asistente de Propiedad Horizontal
-- Execute after all DDL files

-- Subscription Plans
INSERT INTO subscription_plans (name, code, description, max_tenants, max_residents, features, monthly_price) VALUES
('Free', 'free', 'Plan básico con PQRS y documentos', 1, 10,
 '{"pqrs": true, "documents": true, "resident_portal": true, "admin_dashboard": true}', 0),
('Basic', 'basic', 'Plan básico con reservas incluidas', 3, 50,
 '{"pqrs": true, "documents": true, "resident_portal": true, "reservations": true, "admin_dashboard": true}', 50000),
('Professional', 'professional', 'Plan completo con asambleas y convivencia', 10, 200,
 '{"pqrs": true, "documents": true, "resident_portal": true, "reservations": true, "assemblies": true, "convivencia": true, "admin_dashboard": true}', 150000),
('Enterprise', 'enterprise', 'Plan enterprise con todos los módulos', 999999, 999999,
 '{"pqrs": true, "documents": true, "resident_portal": true, "reservations": true, "assemblies": true, "convivencia": true, "financial": true, "access": true, "admin_dashboard": true, "superuser_access": true}', 500000);

-- Roles
INSERT INTO roles (name, description) VALUES
('superuser', 'Superusuario — acceso total global'),
('admin', 'Administrador de copropiedad'),
('comite', 'Comité de convivencia'),
('vigilancia', 'Personal de vigilancia'),
('resident', 'Residente/Propietario');

-- Permissions (one per feature)
INSERT INTO permissions (name, description, feature_flag) VALUES
('pqrs_access', 'Acceso al módulo PQR', 'pqrs'),
('documents_access', 'Acceso al módulo documental', 'documents'),
('reservations_access', 'Acceso al módulo de reservas', 'reservations'),
('financial_access', 'Acceso al módulo financiero', 'financial'),
('assemblies_access', 'Acceso al módulo de asambleas', 'assemblies'),
('convivencia_access', 'Acceso al módulo de convivencia', 'convivencia'),
('access_access', 'Acceso al módulo de control de acceso', 'access'),
('resident_portal_access', 'Acceso al portal de residente', 'resident_portal'),
('admin_dashboard_access', 'Acceso al dashboard de administrador', 'admin_dashboard'),
('superuser_access', 'Acceso superuser global', 'superuser_access');

-- Role -> Permission mapping
-- Superuser: all permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10);

-- Admin: most permissions (no superuser)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9);

-- Comite: pqrs, documents, convivencia, assemblies
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 2), (3, 6), (3, 5);

-- Vigilancia: access, documents
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, 7), (4, 2);

-- Resident: pqrs, documents, reservations, resident_portal
INSERT INTO role_permissions (role_id, permission_id) VALUES
(5, 1), (5, 2), (5, 3), (5, 8);

-- Sample Tenant: "Conjunto Altah" (plan Professional)
INSERT INTO tenants (name, address, total_units, plan_id, subscription_status, subscription_start, subscription_end, created_by, is_active)
VALUES
('Conjunto Altah', 'Calle 45 #12-34, Bogotá', 120, 3, 'active', '2026-01-01', '2027-01-01', 1, true);

-- Sample Tenant: "Torres del Parque" (plan Basic)
INSERT INTO tenants (name, address, total_units, plan_id, subscription_status, subscription_start, subscription_end, created_by, is_active)
VALUES
('Torres del Parque', 'Avenida 68 #5-20, Bogotá', 45, 2, 'active', '2026-03-01', '2027-03-01', 1, true);

-- Unit Types
INSERT INTO unit_types (name, description) VALUES
('Apartamento', 'Unidad habitacional tipo apartamento'),
('Casa', 'Unidad habitacional tipo casa'),
('Local Comercial', 'Unidad comercial'),
('Studio', 'Unidad habitacional tipo studio');

-- Superuser account
-- Password hash for 'SuperAPH2026!'
INSERT INTO users (email, password_hash, name, phone, id_number, is_active)
VALUES
('super@aph.com', '$2b$12$SSd70TDaMfbDs8dEDMasluhmDklhY5NBvjRXgAqzMXcW/v6dKbBcO', 'Superusuario', '+57 300 123 4567', '000000', true);

-- Admin of Conjunto Altah
-- Password hash for 'Admin2026!'
INSERT INTO users (email, password_hash, name, phone, id_number, is_active)
VALUES
('admin@altah.com', '$2b$12$yC0FP2R3woy7cpZJ0b.f5.CG28Ub1Kn73IxO/uG6AkzJ9RFDujlWS', 'Carlos Admin', '+57 310 234 5678', '12345678', true);

-- Resident of Conjunto Altah
-- Password hash for 'Resident2026!'
INSERT INTO users (email, password_hash, name, phone, id_number, is_active)
VALUES
('resident@altah.com', '$2b$12$5ia8dIqANC5xiTrZoiehJeZGpksM92E0R3hpM9uKEhQtorTP0bIhS', 'Maria Residente', '+57 320 345 6789', '87654321', true);

-- Assign roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),   -- superuser -> superuser role
(2, 2),   -- admin@altah -> admin role
(3, 5);   -- resident@altah -> resident role

-- Admin assigned to Conjunto Altah
INSERT INTO tenant_admins (tenant_id, user_id, assigned_by)
VALUES (1, 2, 1);

-- Resident access to Conjunto Altah
INSERT INTO user_tenant_access (user_id, tenant_id, access_type, granted_by)
VALUES (3, 1, 'owner', 2);

-- Towers for Conjunto Altah
INSERT INTO towers (tenant_id, name, code, floor_count) VALUES
(1, 'Torre A', 'A', 15),
(1, 'Torre B', 'B', 12);

-- Sample habitational units for Conjunto Altah
INSERT INTO habitational_units (tenant_id, tower_id, unit_type_id, name_code, coefficient, area) VALUES
(1, 1, 1, 'A-101', 3.2000, 85.50),
(1, 1, 1, 'A-102', 3.2000, 85.50),
(1, 1, 1, 'A-201', 4.1000, 110.00),
(1, 1, 1, 'A-202', 4.1000, 110.00),
(1, 2, 1, 'B-101', 2.8000, 75.00),
(1, 2, 1, 'B-102', 2.8000, 75.00);

-- Link resident to unit
INSERT INTO resident_unit_link (resident_id, unit_id, start_date, is_primary)
VALUES (1, 1, '2025-01-01', true);

-- PQRS Categories for Conjunto Altah (tenant 1)
INSERT INTO pqrs_categories (tenant_id, name, pqrs_type, default_assigned_user_id, escalation_timeout_hours)
VALUES
    (1, 'Mantenimiento', 'p', 2, 48),
    (1, 'Mantenimiento', 'q', 2, 24),
    (1, 'Mantenimiento', 'r', 2, 72),
    (1, 'Mantenimiento', 's', 2, 24),
    (1, 'Ruido', 'q', 2, 12),
    (1, 'Ruido', 's', 2, 12),
    (1, 'Sugerencia', 'r', 2, 72),
    (1, 'Petición', 'p', 2, 48);
