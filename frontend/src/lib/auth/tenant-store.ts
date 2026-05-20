import { create } from "zustand";
import { getStoredToken, storeToken, clearToken, getCurrentTenant, storeTenant, clearTenant } from "./store";
import { parseJWT } from "./jwt";

interface TenantInfo {
  id: number;
  name: string;
  plan: string;
  features: Record<string, boolean>;
}

interface TenantState {
  token: string | null;
  tenant: TenantInfo | null;
  role: string;
  isAuthenticated: boolean;
  init: () => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  setTenant: (tenant: TenantInfo) => void;
  switchTenant: (tenant: TenantInfo) => void;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  token: null,
  tenant: null,
  role: "resident",
  isAuthenticated: false,

  init() {
    const token = getStoredToken();
    const tenant = getCurrentTenant();
    const role = token ? parseJWT(token).role : "resident";
    set({ token, tenant: tenant || null, role, isAuthenticated: !!token });
  },

  setToken(token: string) {
    storeToken(token);
    const role = parseJWT(token).role;
    set({ token, role, isAuthenticated: true });
  },

  clearAuth() {
    clearToken();
    clearTenant();
    set({ token: null, tenant: null, role: "resident", isAuthenticated: false });
  },

  setTenant(tenant: TenantInfo) {
    storeTenant(tenant);
    set({ tenant });
  },

  switchTenant(tenant: TenantInfo) {
    storeTenant(tenant);
    set({ tenant });
  },
}));
