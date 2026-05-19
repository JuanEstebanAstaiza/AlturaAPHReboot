"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api/client";
import { storeToken, storeTenant, clearTenant } from "@/lib/auth/store";
import { parseJWT } from "@/lib/auth/jwt";
import type { TenantInfo, MyAccessInfo } from "@/types/user";

export function useTenant() {
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [myAccess, setMyAccess] = useState<MyAccessInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.tenants();
      setTenants(data);
      return data;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load tenants");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMyAccess = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.myAccess();
      setMyAccess(data);
      return data;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load my access");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const selectTenant = useCallback(async (tenantId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.tenantSelect(tenantId);
      storeToken(res.access_token);
      storeTenant({
        id: res.tenant_id,
        name: res.tenant_name,
        plan: res.plan,
        features: res.features,
      });
      const payload = parseJWT(res.access_token);
      return { token: res.access_token, tenant: payload };
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to select tenant");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const switchTenant = useCallback(async (tenantId: number) => {
    const token = localStorage.getItem("aph_auth_token");
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.tenantSelect(tenantId);
      storeToken(res.access_token);
      storeTenant({
        id: res.tenant_id,
        name: res.tenant_name,
        plan: res.plan,
        features: res.features,
      });
      return res;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to switch tenant");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCurrentTenant = useCallback(() => {
    clearTenant();
  }, []);

  return {
    tenants,
    myAccess,
    loading,
    error,
    loadTenants,
    loadMyAccess,
    selectTenant,
    switchTenant,
    clearCurrentTenant,
  };
}
