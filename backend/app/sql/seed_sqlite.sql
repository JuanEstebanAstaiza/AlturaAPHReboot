-- SQLite-compatible seed data for testing
-- No ENUMs, no SERIAL, no TIMESTAMPTZ, no JSONB in SQLite

-- Subscription Plans
INSERT INTO subscription_plans (id, name, code, description, max_tenants, features, monthly_price, status, created_at) VALUES
(1, 'Free', 'free', 'Plan basico con PQRS y documentos', 1, '{"pqrs": true, "documents": true, "resident_portal": true, "admin_dashboard": true}', 0, 1, '2026-01-01'),
(2, 'Basic', 'basic', 'Plan basico con reservas incluidas', 3, '{"pqrs": true, "documents": true, "resident_portal": true, "reservations": true, "admin_dashboard": true}', 50000, 1, '2026-01-01'),
(3, 'Professional', 'professional', 'Plan completo con asambleas y convivencia', 10, '{"pqrs": true, "documents": true, "resident_portal": true, "reservations": true, "assemblies": true, "convivencia": true, "admin_dashboard": true}', 150000, 1, '2026-01-01'),
(4, 'Enterprise', 'enterprise', 'Plan enterprise con todos los modulos', 999999, '{"pqrs": true, "documents": true, "resident_portal": true, "reservations": true, "assemblies": true, "convivencia": true, "financial": true, "access": true, "admin_dashboard": true, "superuser_access": true}', 500000, 1, '2026-01-01');

-- Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'superuser', 'Superusuario - acceso total global'),
(2, 'admin', 'Administrador de copropiedad'),
(3, 'comite', 'Comite de convivencia'),
(4, 'vigilancia', 'Personal de vigilancia'),
(5, 'resident', 'Residente/Propietario');

-- Permissions
INSERT INTO permissions (id, name, description, feature_flag) VALUES
(1, 'pqrs_access', 'Acceso al modulo PQR', 'pqrs'),
(2, 'documents_access', 'Acceso al modulo documental', 'documents'),
(3, 'reservations_access', 'Acceso al modulo de reservas', 'reservations'),
(4, 'financial_access', 'Acceso al modulo financiero', 'financial'),
(5, 'assemblies_access', 'Acceso al modulo de asambleas', 'assemblies'),
(6, 'convivencia_access', 'Acceso al modulo de convivencia', 'convivencia'),
(7, 'access_access', 'Acceso al modulo de control de acceso', 'access'),
(8, 'resident_portal_access', 'Acceso al portal de residente', 'resident_portal'),
(9, 'admin_dashboard_access', 'Acceso al dashboard de administrador', 'admin_dashboard'),
(10, 'superuser_access', 'Acceso superuser global', 'superuser_access');

-- Role -> Permission mapping
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(2, 1), (2, 2), (2, 3), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9),
(3, 1), (3, 2), (3, 6), (3, 5),
(4, 7), (4, 2),
(5, 1), (5, 2), (5, 3), (5, 8);

-- Unit Types
INSERT INTO unit_types (id, name, description) VALUES
(1, 'Apartamento', 'Unidad habitacional tipo apartamento'),
(2, 'Casa', 'Unidad habitacional tipo casa'),
(3, 'Local Comercial', 'Unidad comercial'),
(4, 'Studio', 'Unidad habitacional tipo studio');

-- Tenants
INSERT INTO tenants (id, name, address, total_units, plan_id, subscription_status, subscription_start, subscription_end, created_by, created_at, updated_at, is_active) VALUES
(1, 'Conjunto Altah', 'Calle 45 #12-34, Bogota', 120, 3, 'active', '2026-01-01', '2027-01-01', 1, '2026-01-01', '2026-01-01', 1),
(2, 'Torres del Parque', 'Avenida 68 #5-20, Bogota', 45, 2, 'active', '2026-03-01', '2027-03-01', 1, '2026-03-01', '2026-03-01', 1),
(3, 'Residencial Las Palmas', 'Carrera 15 #8-30, Bogota', 60, 2, 'active', '2026-04-01', '2027-04-01', 1, '2026-04-01', '2026-04-01', 1),
(4, 'Edificio Central', 'Diagonal 72 #45-10, Bogota', 200, 3, 'active', '2026-05-01', '2027-05-01', 1, '2026-05-01', '2026-05-01', 1);

-- Users
INSERT INTO users (id, email, password_hash, name, phone, id_number, created_at, updated_at, is_active) VALUES
(1, 'super@aph.com', '$2b$12$SSd70TDaMfbDs8dEDMasluhmDklhY5NBvjRXgAqzMXcW/v6dKbBcO', 'Superusuario', '+57 300 123 4567', '000000', '2026-01-01', '2026-01-01', 1),
(2, 'admin@altah.com', '$2b$12$yC0FP2R3woy7cpZJ0b.f5.CG28Ub1Kn73IxO/uG6AkzJ9RFDujlWS', 'Carlos Admin', '+57 310 234 5678', '12345678', '2026-01-01', '2026-01-01', 1),
(3, 'resident@altah.com', '$2b$12$5ia8dIqANC5xiTrZoiehJeZGpksM92E0R3hpM9uKEhQtorTP0bIhS', 'Maria Residente', '+57 320 345 6789', '87654321', '2026-01-01', '2026-01-01', 1),
(4, 'admin2@torres.com', '$2b$12$p0xEy9evp4.JjvVg2kpAY.2spNdp9V8RvdfaEY/SMqYZvgLLiFGyG', 'Laura Admin Torres', '+57 311 234 5678', '23456789', '2026-03-01', '2026-03-01', 1),
(5, 'admin3@palmas.com', '$2b$12$yC0FP2R3woy7cpZJ0b.f5.CG28Ub1Kn73IxO/uG6AkzJ9RFDujlWS', 'Diego Admin Palmas', '+57 312 345 6789', '34567890', '2026-04-01', '2026-04-01', 1),
(6, 'resident2@torres.com', '$2b$12$syumNW/D1q5iEW5AMeokwecJb.malT4gTi9utwUY/sfo7FJRI3VHy', 'Pedro Residente Torres', '+57 321 456 7890', '45678901', '2026-03-01', '2026-03-01', 1),
(7, 'resident3@palmas.com', '$2b$12$syumNW/D1q5iEW5AMeokwecJb.malT4gTi9utwUY/sfo7FJRI3VHy', 'Ana Residente Palmas', '+57 322 567 8901', '56789012', '2026-04-01', '2026-04-01', 1);

-- User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), (2, 2), (3, 5), (4, 2), (5, 2), (6, 5), (7, 5);

-- Tenant Admins
INSERT INTO tenant_admins (id, tenant_id, user_id, assigned_by, assigned_at, status) VALUES
(1, 1, 2, 1, '2026-01-01', 'active'),
(2, 2, 4, 1, '2026-03-01', 'active'),
(3, 3, 5, 1, '2026-04-01', 'active'),
(4, 4, 2, 1, '2026-05-01', 'active');

-- User Tenant Access (residents)
INSERT INTO user_tenant_access (id, user_id, tenant_id, access_type, granted_by, granted_at, valid_from, valid_to) VALUES
(1, 3, 1, 'owner', 2, '2026-01-01', '2025-01-01', NULL),
(2, 6, 2, 'owner', 4, '2026-03-01', '2026-01-01', NULL),
(3, 7, 3, 'owner', 5, '2026-04-01', '2026-02-01', NULL);

-- Residents
INSERT INTO residents (id, user_id, tenant_id, type, name, id_number, phone, email, created_at, updated_at) VALUES
(1, 3, 1, 'owner', 'Maria Residente', '87654321', '+57 320 345 6789', 'resident@altah.com', '2026-01-01', '2026-01-01'),
(2, 6, 2, 'owner', 'Pedro Residente Torres', '45678901', '+57 321 456 7890', 'resident2@torres.com', '2026-03-01', '2026-03-01'),
(3, 7, 3, 'owner', 'Ana Residente Palmas', '56789012', '+57 322 567 8901', 'resident3@palmas.com', '2026-04-01', '2026-04-01');

-- Towers
INSERT INTO towers (id, tenant_id, name, code, floor_count, created_at) VALUES
(1, 1, 'Torre A', 'A', 15, '2026-01-01'),
(2, 1, 'Torre B', 'B', 12, '2026-01-01'),
(3, 2, 'Torre A', 'A', 10, '2026-03-01'),
(4, 2, 'Torre B', 'B', 8, '2026-03-01'),
(5, 3, 'Torre Unica', 'U', 20, '2026-04-01'),
(6, 4, 'Torre A', 'A', 25, '2026-05-01'),
(7, 4, 'Torre B', 'B', 25, '2026-05-01');

-- Habitational Units
INSERT INTO habitational_units (id, tenant_id, tower_id, unit_type_id, name_code, coefficient, area, created_at) VALUES
(1, 1, 1, 1, 'A-101', 3.2000, 85.50, '2026-01-01'),
(2, 1, 1, 1, 'A-102', 3.2000, 85.50, '2026-01-01'),
(3, 1, 1, 1, 'A-201', 4.1000, 110.00, '2026-01-01'),
(4, 1, 1, 1, 'A-202', 4.1000, 110.00, '2026-01-01'),
(5, 1, 2, 1, 'B-101', 2.8000, 75.00, '2026-01-01'),
(6, 1, 2, 1, 'B-102', 2.8000, 75.00, '2026-01-01'),
(7, 2, 3, 1, 'A-101', 3.0000, 80.00, '2026-03-01'),
(8, 2, 3, 1, 'A-201', 3.5000, 95.00, '2026-03-01'),
(9, 2, 4, 1, 'B-101', 2.5000, 70.00, '2026-03-01'),
(10, 3, 5, 2, 'Casa 1', 5.0000, 150.00, '2026-04-01'),
(11, 3, 5, 2, 'Casa 2', 5.0000, 150.00, '2026-04-01'),
(12, 3, 5, 2, 'Casa 5', 5.0000, 150.00, '2026-04-01'),
(13, 4, 6, 1, 'A-101', 4.0000, 120.00, '2026-05-01'),
(14, 4, 6, 1, 'A-201', 4.5000, 135.00, '2026-05-01'),
(15, 4, 7, 1, 'B-101', 3.8000, 110.00, '2026-05-01');

-- Resident Unit Links
INSERT INTO resident_unit_link (id, resident_id, unit_id, parking_id, start_date, is_primary) VALUES
(1, 1, 1, NULL, '2025-01-01', 1),
(2, 2, 7, NULL, '2026-01-01', 1),
(3, 3, 12, NULL, '2026-02-01', 1);

-- PQRS Categories for Conjunto Altah (tenant 1)
INSERT INTO pqrs_categories (id, tenant_id, name, pqrs_type, default_assigned_user_id, escalation_timeout_hours, created_at) VALUES
(1, 1, 'Mantenimiento', 'p', 2, 48, '2026-01-01'),
(2, 1, 'Mantenimiento', 'q', 2, 24, '2026-01-01'),
(3, 1, 'Mantenimiento', 'r', 2, 72, '2026-01-01'),
(4, 1, 'Mantenimiento', 's', 2, 24, '2026-01-01'),
(5, 1, 'Ruido', 'q', 2, 12, '2026-01-01'),
(6, 1, 'Ruido', 's', 2, 12, '2026-01-01'),
(7, 1, 'Sugerencia', 'r', 2, 72, '2026-01-01'),
(8, 1, 'Petición', 'p', 2, 48, '2026-01-01');
