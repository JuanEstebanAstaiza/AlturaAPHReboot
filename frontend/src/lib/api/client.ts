import { BASE_URL } from "@/lib/constants";
import { getStoredToken, getCurrentTenant, clearToken } from "@/lib/auth/store";
import { parseJWT, isTokenExpired } from "@/lib/auth/jwt";
import type { FeatureBlockedResponse } from "@/types/user";

export class FeatureBlockedError extends Error {
  constructor(public data: FeatureBlockedResponse) {
    super(data.error);
    this.name = "FeatureBlockedError";
  }
}

export class AuthError extends Error {
  constructor(public status: number, public detail: string) {
    super(detail);
    this.name = "AuthError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const tenant = getCurrentTenant();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (tenant?.id) {
    headers.set("X-Tenant-ID", String(tenant.id));
  }

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    clearToken();
    throw new AuthError(401, "Session expired. Please log in again.");
  }

  if (response.status === 403) {
    const body = await response.json().catch(() => ({}));
    if (body.error === "feature_not_available") {
      throw new FeatureBlockedError(body as FeatureBlockedResponse);
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; refresh_token: string; role: string; name: string }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }),
    tenants: () => request<any[]>("/api/auth/tenants"),
    myAccess: () => request<any[]>("/api/auth/my-access"),
    tenantSelect: (tenantId: number) =>
      request<{ access_token: string; tenant_id: number; tenant_name: string; plan: string; features: Record<string, boolean> }>(
        "/api/auth/tenant-select",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenant_id: tenantId }),
        }
      ),
  },
  superuser: {
    dashboard: () => request<any>("/api/superuser/dashboard"),
    tenants: () => request<any[]>("/api/superuser/tenants"),
    tenantDetail: (id: number) => request<any>(`/api/superuser/tenants/${id}`),
    updatePlan: (tenantId: number, planId: number) =>
      request<any>(`/api/superuser/tenants/${tenantId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      }),
    users: (tenantId: number) => request<any[]>(`/api/superuser/tenants/${tenantId}/users`),
    admins: (tenantId: number) => request<any[]>(`/api/superuser/tenants/${tenantId}/admins`),
    assignAdmin: (tenantId: number, userId: number) =>
      request<any>(`/api/superuser/tenants/${tenantId}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      }),
    audit: (limit = 100, offset = 0, tenantId?: number) => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (tenantId) params.set("tenant_id", String(tenantId));
      return request<any[]>(`/api/superuser/audit?${params}`);
    },
    createAdmin: (data: { email: string; password: string; name: string; phone?: string; id_number?: string; tenant_id: number }) =>
      request<any>("/api/superuser/admins/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    availableUsers: () => request<any[]>("/api/superuser/admins/available"),
    analytics: (tenantId: number) =>
      request<any>(`/api/superuser/analytics/usage?tenant_id=${tenantId}`),
    revenue: () => request<any>("/api/superuser/analytics/revenue"),
    plans: () => request<any[]>("/api/superuser/plans"),
    createPlan: (data: { name: string; code: string; description?: string; max_tenants: number; max_residents: number; features: Record<string, boolean>; monthly_price: number }) =>
      request<any>("/api/superuser/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    updatePlanDef: (planId: number, data: Record<string, any>) =>
      request<any>(`/api/superuser/plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    deactivatePlan: (planId: number) =>
      request<any>(`/api/superuser/plans/${planId}`, {
        method: "DELETE",
      }),
  },
  tenants: {
    create: (data: { name: string; address?: string; total_units: number; plan_id: number }) =>
      request<any>("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    detail: (id: number) => request<any>(`/api/tenants/${id}`),
    updatePlan: (id: number, planId: number) =>
      request<any>(`/api/tenants/${id}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      }),
    addAdmin: (id: number, userId: number) =>
      request<any>(`/api/tenants/${id}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      }),
  },
  residents: {
    directory: () => request<any[]>("/api/residents"),
    profile: (userId: number) => request<any>(`/api/residents/${userId}`),
  },
  units: {
    towers: () => request<any[]>("/api/units/towers"),
    towerDetail: (id: number) => request<any>(`/api/units/towers/${id}`),
    createTower: (data: { name: string; code: string; floor_count: number }) =>
      request<any>("/api/units/towers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    listings: () => request<any[]>("/api/units"),
    unitDetail: (id: number) => request<any>(`/api/units/${id}`),
  },
  pqrs: {
    tickets: (params?: Record<string, string>) => {
      const search = new URLSearchParams(params);
      return request<any[]>(`/api/pqrs/tickets?${search}`);
    },
    createTicket: (params: Record<string, string>) => {
      const search = new URLSearchParams(params);
      return request<any>(`/api/pqrs/tickets?${search}`, {
        method: "POST",
      });
    },
    ticket: (id: number) => request<any>(`/api/pqrs/tickets/${id}`),
    updateStatus: (id: number, status: string) =>
      request<any>(`/api/pqrs/tickets/${id}/status?status=${status}`, {
        method: "PUT",
      }),
    assignTicket: (id: number, userId: number) =>
      request<any>(`/api/pqrs/tickets/${id}/assign?user_id=${userId}`, {
        method: "PUT",
      }),
    comments: (id: number) => request<any[]>(`/api/pqrs/tickets/${id}/comments`),
    addComment: (id: number, message: string) =>
      request<any>(`/api/pqrs/tickets/${id}/comments?message=${encodeURIComponent(message)}`, {
        method: "POST",
      }),
    attachments: (id: number) => request<any[]>(`/api/pqrs/tickets/${id}/attachments`),
    stats: () => request<any>("/api/pqrs/stats"),
    categories: () => request<any[]>("/api/pqrs/categories"),
    createCategory: (params: Record<string, string | number | undefined>) => {
      const search = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) search.set(k, String(v));
      }
      return request<any>(`/api/pqrs/categories?${search}`, {
        method: "POST",
      });
    },
  },
};

export function handleAuthResult(role: string): string {
  if (role === "superuser") return "/superuser";
  return "/login/tenant-select";
}
