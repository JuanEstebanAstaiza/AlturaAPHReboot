const TOKEN_KEY = "aph_auth_token";
const TENANT_KEY = "aph_current_tenant";

export function getStoredToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function storeToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getCurrentTenant(): { id: number; name: string; plan: string; features: Record<string, boolean> } | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(TENANT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function storeTenant(tenant: { id: number; name: string; plan: string; features: Record<string, boolean> }): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TENANT_KEY, JSON.stringify(tenant));
}

export function clearTenant(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TENANT_KEY);
}
