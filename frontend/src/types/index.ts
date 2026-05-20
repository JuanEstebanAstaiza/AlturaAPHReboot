export type { User, LoginResponse, JWTPayload, TenantInfo, MyAccessInfo, FeatureBlockedResponse, CurrentTenant } from "./user";

export interface ResidentProfile {
  id: number;
  user_id: number;
  tenant_id: number;
  tenant_name: string;
  type: "owner" | "tenant" | "temporary";
  name: string;
  id_number: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResidentDirectoryEntry {
  id: number;
  name: string;
  type: string;
  phone: string | null;
  email: string | null;
  units: string[];
  access_type: string;
}

export interface TowerDetail {
  id: number;
  tenant_id: number;
  name: string;
  code: string;
  floor_count: number;
  created_at: string;
}

export interface UnitDetail {
  id: number;
  tenant_id: number;
  tower_id: number;
  tower_name: string | null;
  unit_type_id: number;
  unit_type_name: string | null;
  name_code: string;
  coefficient: number;
  area: number | null;
  created_at: string;
}

export interface SuperuserDashboard {
  total_tenants: number;
  active_tenants: number;
  total_users: number;
  total_revenue: number;
  subscriptions_by_plan: Record<string, number>;
}

export interface AnalyticsUsage {
  tenant_id: number;
  tenant_name: string;
  pqrs_count: number;
  documents_count: number;
  reservations_count: number;
  residents_count: number;
  active_users_last_30d: number;
}

export interface AuditLogEntry {
  id: number;
  user_id: number;
  user_name: string | null;
  tenant_id: number | null;
  tenant_name: string | null;
  action: string;
  resource: string;
  resource_id: number | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  timestamp: string;
}

export interface SubscriptionRevenue {
  total_revenue: number;
  monthly_revenue: { month: string; revenue: number }[];
  by_plan: Record<string, number>;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  author_name: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Document {
  id: number;
  title: string;
  category: string;
  access_level: string;
  file_type: string;
  file_size: number;
  version: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: number;
  name: string;
  type: string;
  description: string;
  hourly_rate: number;
  max_capacity: number;
  available: boolean;
}

export interface Booking {
  id: number;
  zone_id: number;
  zone_name: string;
  unit_name: string;
  user_name: string;
  start_date: string;
  end_date: string;
  status: string;
  fee: number;
  created_at: string;
}

// PQRS types

export interface PQRSTicket {
  id: number;
  ticket_number: string;
  tenant_id: number;
  type: "p" | "q" | "r" | "s";
  status: "open" | "in_progress" | "escalated" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  description: string;
  created_by: number;
  created_by_name: string | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface PQRSTicketList {
  id: number;
  ticket_number: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  created_by_name: string | null;
  assigned_to_name: string | null;
  created_at: string;
}

export interface PQRSComment {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name: string | null;
  message: string;
  created_at: string;
}

export interface PQRSAttachment {
  id: number;
  ticket_id: number;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: number;
  uploaded_by_name: string | null;
  uploaded_at: string;
}

export interface PQRSCategory {
  id: number;
  tenant_id: number;
  name: string;
  pqrs_type: string;
  default_assigned_user_id: number | null;
  escalation_timeout_hours: number;
  created_at: string;
}

export interface PQRSStats {
  tenant_id: number;
  total_tickets: number;
  open_count: number;
  in_progress_count: number;
  escalated_count: number;
  closed_count: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  by_status: Record<string, number>;
}

export type PQRSType = "p" | "q" | "r" | "s";
export type PQRSStatus = "open" | "in_progress" | "escalated" | "closed";
export type PQRSPriority = "low" | "medium" | "high" | "urgent";

export const PQRS_TYPE_LABELS: Record<PQRSType, string> = {
  p: "Petición",
  q: "Queja",
  r: "Reclamación",
  s: "Sugerencia",
};

export const PQRS_STATUS_LABELS: Record<PQRSStatus, string> = {
  open: "Abierta",
  in_progress: "En Progreso",
  escalated: "Escalada",
  closed: "Cerrada",
};

export const PQRS_PRIORITY_LABELS: Record<PQRSPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};
