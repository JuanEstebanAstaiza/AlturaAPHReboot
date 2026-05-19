import type { JWTPayload } from "@/types/user";
import type { Role } from "@/lib/constants";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

export function parseJWT(token: string): JWTPayload {
  try {
    const payload = token.split(".")[1];
    if (!payload) throw new Error("Invalid token format");
    const decoded = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return { sub: 0, role: "resident" as Role, exp: 0, iat: 0 };
  }
}

export function isSuperuser(token: string): boolean {
  return parseJWT(token).role === "superuser";
}

export function hasFeature(token: string, feature: string): boolean {
  const payload = parseJWT(token);
  if (payload.role === "superuser") return true;
  return payload.features?.[feature] === true;
}

export function getTenantPlan(token: string): string {
  return parseJWT(token).tenant_plan || "free";
}

export function getTenantId(token: string): number | null {
  const payload = parseJWT(token);
  return payload.tenant_id ?? null;
}

export function getFeatures(token: string): Record<string, boolean> {
  const payload = parseJWT(token);
  if (payload.role === "superuser") {
    return Object.fromEntries(SUBSCRIPTION_PLANS.enterprise.features.map((f) => [f, true])) as Record<string, boolean>;
  }
  return payload.features ?? {} as Record<string, boolean>;
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJWT(token);
  return payload.exp <= Math.floor(Date.now() / 1000);
}
