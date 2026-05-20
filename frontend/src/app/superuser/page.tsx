"use client";

import { useSuperuserDashboard, useSuperuserTenants } from "@/hooks/useSuperuser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, PieChart } from "@/components/ui/chart";
import { Building2, Users, DollarSign, Globe, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/constants";

export default function SuperuserDashboardPage() {
  const { data: dashboard, isLoading: loadingDashboard } = useSuperuserDashboard();
  const { data: tenants, isLoading: loadingTenants } = useSuperuserTenants();

  if (loadingDashboard || loadingTenants) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = dashboard
    ? [
        {
          label: "Tenants Totales",
          value: dashboard.total_tenants?.toString() || tenants?.length.toString() || "0",
          change: `${dashboard.active_tenants || 0} active`,
          trend: "up" as const,
          icon: <Globe className="h-5 w-5" />,
        },
        {
          label: "Total Usuarios",
          value: (dashboard.total_users || "0").toString(),
          change: "+28 this month",
          trend: "up" as const,
          icon: <Users className="h-5 w-5" />,
        },
        {
          label: "Ingresos Totales",
          value: formatCurrency(dashboard.total_revenue || 0),
          change: "+18%",
          trend: "up" as const,
          icon: <DollarSign className="h-5 w-5" />,
        },
        {
          label: "Suscripciones Ativas",
          value: (dashboard.active_tenants || "0").toString(),
          change: `${Object.keys(dashboard.subscriptions_by_plan || {}).length} plans`,
          trend: "up" as const,
          icon: <Building2 className="h-5 w-5" />,
        },
      ]
    : tenants
      ? [
          { label: "Tenants Totales", value: tenants.length.toString(), change: "—", trend: "up" as const, icon: <Globe className="h-5 w-5" /> },
          { label: "Unidades Globales", value: tenants.reduce((s, t) => s + (t.total_units || 0), 0).toString(), change: "—", trend: "up" as const, icon: <Building2 className="h-5 w-5" /> },
          { label: "Residentes", value: tenants.reduce((s, t) => s + (t.residents_count || 0), 0).toString(), change: "—", trend: "up" as const, icon: <Users className="h-5 w-5" /> },
          { label: "Ingresos Totales", value: formatCurrency(0), change: "—", trend: "up" as const, icon: <DollarSign className="h-5 w-5" /> },
        ]
      : [];

  const chartData = dashboard?.subscriptions_by_plan
    ? Object.entries(dashboard.subscriptions_by_plan).map(([label, value]) => ({ label, value: Number(value) }))
    : tenants
      ? tenants.map((t) => ({ label: t.name || "Tenant", value: t.total_units || 0 }))
      : [];

  const subscriptionHealth = dashboard?.subscriptions_by_plan
    ? Object.entries(dashboard.subscriptions_by_plan).map(([label, count]) => ({
        label: SUBSCRIPTION_STATUS_LABELS[label] || label,
        count: Number(count),
        color: "text-accent",
      }))
    : [
        { label: "Active", count: tenants?.filter((t) => t.is_active).length || 0, color: "text-accent" },
        { label: "Inactive", count: tenants?.filter((t) => !t.is_active).length || 0, color: "text-muted-foreground" },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Superuser Dashboard</h1>
        <p className="text-muted-foreground">Vista global de todos los tenants</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-accent" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-alert" />
                )}
                {kpi.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart data={chartData.length > 0 ? chartData : [{ label: "No data", value: 0 }]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={chartData.length > 0 ? chartData : [{ label: "No data", value: 0 }]} />
          </CardContent>
        </Card>
      </div>

      {/* Subscription Health */}
      <Card>
        <CardHeader>
          <CardTitle>Salud de Suscripciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subscriptionHealth.map((item: any) => (
              <div key={item.label} className="text-center">
                <div className={`text-2xl font-bold ${item.color}`}>{item.count}</div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(dashboard?.subscriptions_by_plan || {})
              .filter(([label]) => label === "expired" || label === "cancelled")
              .slice(0, 4)
              .map(([label, count], i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0">
                  <Badge variant={label === "expired" ? "destructive" : "warning"}>
                    {SUBSCRIPTION_STATUS_LABELS[label] || label}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Suscripción {label}</p>
                    <p className="text-xs text-muted-foreground truncate">{String(count)} plan(s)</p>
                  </div>
                </div>
              ))}
            {Object.keys(dashboard?.subscriptions_by_plan || {}).length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">No hay alertas de suscripción.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
