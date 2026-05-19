"use client";

import { Building2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_STATUS_COLORS } from "@/lib/constants";
import type { TenantInfo } from "@/types/user";

interface TenantSelectPanelProps {
  tenants: TenantInfo[];
  loading: boolean;
  onSelect: (tenantId: number) => Promise<void>;
  role: string;
}

export function TenantSelectPanel({ tenants, loading, onSelect, role }: TenantSelectPanelProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl border-border shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {role === "resident" ? "Selecciona tu propiedad" : "Selecciona un tenant"}
          </CardTitle>
          <CardDescription>
            {role === "resident"
              ? "Elige la propiedad a la que quieres acceder"
              : "Elige el tenant con el que quieres trabajar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tenants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tenants disponibles</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {tenants.map((t) => (
                <button
                  key={t.tenant_id}
                  onClick={() => onSelect(t.tenant_id)}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card text-left hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{t.tenant_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{t.plan} plan</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn(SUBSCRIPTION_STATUS_COLORS[t.subscription_status] || "bg-gray-100 text-gray-800")}
                      >
                        {t.subscription_status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{t.total_units} unidades</span>
                    </div>
                  </div>
                  <Check className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper for cn since it's used inline
import { cn } from "@/lib/utils";
