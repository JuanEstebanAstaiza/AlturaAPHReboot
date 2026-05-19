import type { Role } from "@/lib/constants";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  role: Role;
  name: string;
}

export interface JWTPayload {
  sub: number;
  role: Role;
  exp: number;
  iat: number;
  tenant_id?: number;
  tenant_plan?: string;
  features?: Record<string, boolean>;
}

export interface TenantInfo {
  tenant_id: number;
  tenant_name: string;
  plan: string;
  features: Record<string, boolean>;
  subscription_status: string;
  total_units: number;
}

export interface MyAccessInfo {
  tenant_id: number;
  tenant_name: string;
  unit_name: string | null;
  access_type: string;
}

export interface FeatureBlockedResponse {
  error: string;
  feature: string;
  tenant_plan: string;
  available_features: string[];
  upgrade_url?: string;
}

export interface CurrentTenant {
  id: number;
  name: string;
  plan: string;
  features: Record<string, boolean>;
}
