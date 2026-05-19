"use client";

import { useState, useEffect, useCallback } from "react";
import { api, handleAuthResult } from "@/lib/api/client";
import { storeToken, clearToken, getCurrentTenant, getStoredToken } from "@/lib/auth/store";
import { parseJWT, isSuperuser } from "@/lib/auth/jwt";

export function useAuth() {
  const [user, setUser] = useState<{ id: number; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (token && !isSuperuser(token)) {
      const tenant = getCurrentTenant();
      if (!tenant) {
        // Need tenant selection
        setUser(null);
      } else {
        const payload = parseJWT(token);
        setUser({ id: payload.sub, name: token.split(".")[1] ? "" : "", role: payload.role });
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await api.auth.login(email, password);
      storeToken(res.access_token);
      const payload = parseJWT(res.access_token);
      setUser({ id: payload.sub, name: res.name, role: res.role });
      return res.role;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      setError(msg);
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setError(null);
  }, []);

  const refreshUser = useCallback(() => {
    const token = getStoredToken();
    if (token) {
      const payload = parseJWT(token);
      setUser({ id: payload.sub, name: "", role: payload.role });
    } else {
      setUser(null);
    }
  }, []);

  return { user, loading, error, login, logout, refreshUser };
}

export function getRedirectAfterLogin(role: string): string {
  return handleAuthResult(role);
}
