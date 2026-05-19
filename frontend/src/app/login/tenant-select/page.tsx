"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TenantSelectPanel } from "@/components/auth/TenantSelectPanel";
import { ResidentAccessPanel } from "@/components/auth/ResidentAccessPanel";
import { getStoredToken, storeToken, storeTenant } from "@/lib/auth/store";
import { parseJWT } from "@/lib/auth/jwt";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Loader2 } from "lucide-react";

export default function TenantSelectPage() {
  const router = useRouter();
  const token = getStoredToken();
  const role = token ? parseJWT(token).role : "resident";
  const [tenants, setTenants] = useState<any[]>([]);
  const [myAccess, setMyAccess] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (role === "resident") {
          const data = await api.auth.myAccess();
          setMyAccess(data);
        } else {
          const data = await api.auth.tenants();
          setTenants(data);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [role]);

  const handleSelect = async (tenantId: number) => {
    try {
      const res = await api.auth.tenantSelect(tenantId);
      storeToken(res.access_token);
      storeTenant({ id: res.tenant_id, name: res.tenant_name, plan: res.plan, features: res.features || {} });
      router.push("/dashboard");
    } catch {
      // Silently retry
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {role === "resident" ? (
              <Home className="h-6 w-6 text-primary" />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {role === "resident" ? "Selecciona tu Propiedad" : "Selecciona un Tenant"}
          </CardTitle>
          <CardDescription>
            {role === "resident"
              ? "Elige la propiedad donde resides para continuar"
              : "Selecciona el tenant donde deseas trabajar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : role === "resident" ? (
            <ResidentAccessPanel myAccess={myAccess} loading={false} onSelect={handleSelect} />
          ) : (
            <TenantSelectPanel tenants={tenants} loading={false} onSelect={handleSelect} role={role} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
