"use client";

import { useState, useEffect } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api/client";
import { getStoredToken } from "@/lib/auth/store";
import { parseJWT } from "@/lib/auth/jwt";

interface Tenant {
  tenant_id: number;
  tenant_name: string;
  plan: string;
  subscription_status: string;
  total_units: number;
}

export function TenantSwitcher() {
  const [open, setOpen] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<{ id: number; name: string; plan: string } | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    const payload = parseJWT(token);
    if (payload.tenant_id) {
      setCurrentTenant({ id: payload.tenant_id, name: "", plan: payload.tenant_plan || "free" });
    }
  }, []);

  const loadTenants = async () => {
    if (!open) return;
    try {
      const data = await api.auth.tenants();
      setTenants(data);
    } catch {
      // Silent fail — will show empty state
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-9 gap-2 px-3 text-sm"
        onClick={() => {
          setOpen(!open);
          if (!open) loadTenants();
        }}
      >
        <Building2 className="h-4 w-4" />
        {currentTenant?.name || "Select tenant"}
        <ChevronDown className="h-3 w-3" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-72 rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">TENANTS</p>
            {tenants.map((t) => (
              <button
                key={t.tenant_id}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted text-left transition-colors"
                onClick={() => {
                  setCurrentTenant({ id: t.tenant_id, name: t.tenant_name, plan: t.plan });
                  setOpen(false);
                }}
              >
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.tenant_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{t.plan} plan · {t.total_units} units</p>
                </div>
                {currentTenant?.id === t.tenant_id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
            {tenants.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No tenants found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
