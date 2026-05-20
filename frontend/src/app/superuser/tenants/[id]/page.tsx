"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSuperuserTenant, useUpdateTenantPlan } from "@/hooks/useSuperuser";
import { useTenantDetail } from "@/hooks/useTenants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import { Building2, Users, Edit, Check, X, ArrowLeft } from "lucide-react";

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = Number(params.id);

  const { data: superTenant, isLoading: loadingSuper } = useSuperuserTenant(tenantId);
  const { data: tenant, isLoading: loadingTenant } = useTenantDetail(tenantId);
  const updatePlan = useUpdateTenantPlan();
  const [editingPlan, setEditingPlan] = useState(false);

  if (loadingSuper || loadingTenant) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const planName = superTenant?.plan_name || tenant?.plan_name || "Unknown";
  const plan = SUBSCRIPTION_PLANS[planName as keyof typeof SUBSCRIPTION_PLANS];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/superuser/tenants")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{superTenant?.name || tenant?.name || `Tenant #${tenantId}`}</h1>
          <p className="text-muted-foreground">Detalle del tenant</p>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan Actual</CardTitle>
            <Badge variant="secondary" className="capitalize">{planName}</Badge>
          </CardHeader>
          <CardContent>
            {plan ? (
              <div className="space-y-2">
                <p className="text-sm">Precio mensual: <span className="font-medium text-foreground">{SUBSCRIPTION_PLANS[planName as keyof typeof SUBSCRIPTION_PLANS]?.monthlyPrice ? `$${SUBSCRIPTION_PLANS[planName as keyof typeof SUBSCRIPTION_PLANS].monthlyPrice.toLocaleString()}` : "Gratis"}</span></p>
                <p className="text-sm">Max tenants: <span className="font-medium text-foreground">{plan.maxTenants === 999999 ? "∞" : plan.maxTenants}</span></p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {plan.features.map((f) => (
                    <Badge key={f} variant="default" className="text-xs capitalize">{f}</Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Plan no disponible</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estadísticas</CardTitle>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">Unidades: <span className="font-medium text-foreground">{superTenant?.total_units || tenant?.total_units || "—"}</span></p>
              <p className="text-sm">Estado: <Badge variant={superTenant?.is_active ? "default" : "destructive"}>{superTenant?.is_active ? "Active" : "Inactive"}</Badge></p>
              <p className="text-sm">Dirección: <span className="font-medium text-foreground">{superTenant?.address || tenant?.address || "—"}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Change */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cambiar Plan</CardTitle>
          {!editingPlan && (
            <Button variant="outline" size="sm" onClick={() => setEditingPlan(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Cambiar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingPlan ? (
            <PlanSelector
              currentPlan={planName}
              onConfirm={(newPlan) => {
                updatePlan.mutate({ tenantId, planId: newPlan });
                setEditingPlan(false);
              }}
              onCancel={() => setEditingPlan(false)}
            />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Plan actual: <span className="font-medium text-foreground capitalize">{planName}</span>
              </p>
              {updatePlan.isError && (
                <p className="text-sm text-alert">Error al cambiar plan</p>
              )}
              {updatePlan.isSuccess && (
                <p className="text-sm text-accent">Plan actualizado exitosamente</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PlanSelector({ currentPlan, onConfirm, onCancel }: { currentPlan: string; onConfirm: (planId: number) => void; onCancel: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(SUBSCRIPTION_PLANS).map(([name, plan]) => (
          <div
            key={name}
            className={`p-3 rounded-lg border ${name === currentPlan ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium capitalize text-foreground">{name}</span>
              {name === currentPlan && <Badge variant="default">Current</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {plan.monthlyPrice === 0 ? "Gratis" : `$${plan.monthlyPrice.toLocaleString()}/mes`}
            </p>
            {name !== currentPlan && (
              <Button size="sm" onClick={() => onConfirm(SUBSCRIPTION_PLANS[name as keyof typeof SUBSCRIPTION_PLANS].monthlyPrice)}>
                Seleccionar
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  );
}
