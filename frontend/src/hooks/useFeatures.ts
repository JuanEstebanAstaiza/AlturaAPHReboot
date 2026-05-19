"use client";

import { getStoredToken } from "@/lib/auth/store";
import { hasFeature } from "@/lib/auth/jwt";

export function useFeatures() {
  const token = getStoredToken();

  const check = (feature: string): boolean => {
    if (!token) return false;
    return hasFeature(token, feature);
  };

  const getAvailable = (): string[] => {
    if (!token) return [];
    const payload = parseJWTFromToken(token);
    if (payload.role === "superuser") {
      return [
        "pqrs", "documents", "reservations", "financial", "assemblies",
        "convivencia", "access", "admin_dashboard", "resident_portal", "superuser_access",
      ];
    }
    return Object.entries(payload.features ?? {})
      .filter(([, v]) => v === true)
      .map(([k]) => k);
  };

  return { check, getAvailable };
}

function parseJWTFromToken(token: string): { role: string; features?: Record<string, boolean> } {
  try {
    const payload = token.split(".")[1];
    if (!payload) return { role: "resident" };
    const decoded = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(decoded);
  } catch {
    return { role: "resident" };
  }
}
