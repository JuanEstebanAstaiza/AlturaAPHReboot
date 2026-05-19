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
    analytics: (tenantId: number) =>
      request<any>(`/api/superuser/analytics/usage?tenant_id=${tenantId}`),
    revenue: () => request<any>("/api/superuser/analytics/revenue"),
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
};

export function handleAuthResult(role: string): string {
  if (role === "superuser") return "/superuser";
  return "/login/tenant-select";
}
