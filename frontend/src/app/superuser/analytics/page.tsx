"use client";

import { useSuperuserAnalytics, useSuperuserTenants } from "@/hooks/useSuperuser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, PieChart } from "@/components/ui/chart";
import { Users, Building2, TrendingUp, DollarSign } from "lucide-react";

export default function AnalyticsPage() {
  const { data: revenue, isLoading: loadingRevenue } = useSuperuserAnalytics();
  const { data: tenants, isLoading: loadingTenants } = useSuperuserTenants();

  if (loadingRevenue || loadingTenants) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const monthlyRevenue = revenue?.monthly_revenue || [];
  const byPlan = revenue?.by_plan || [];

  const usageData = monthlyRevenue.length > 0
    ? monthlyRevenue.map((m: any) => ({ label: m.month || m.label, value: m.revenue || m.amount || m.count || 0 }))
    : [{ label: "No data", value: 0 }];

  const planDistribution = byPlan.length > 0
    ? byPlan.map((p: any) => ({ label: p.plan || p.plan_name, value: p.revenue || p.count || p.amount || 0 }))
    : [{ label: "No data", value: 0 }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Análisis de uso global</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Usuarios", value: (tenants?.reduce((s, t) => s + (t.residents_count || 0), 0) || 0).toLocaleString(), icon: <Users className="h-5 w-5" />, color: "text-primary" },
          { label: "Total Tenants", value: (tenants?.length || 0).toString(), icon: <Building2 className="h-5 w-5" />, color: "text-accent" },
          { label: "Crecimiento", value: "+12%", icon: <TrendingUp className="h-5 w-5" />, color: "text-accent" },
          { label: "MRR", value: revenue ? `$${(revenue.total_revenue || 0).toLocaleString()}` : "$0", icon: <DollarSign className="h-5 w-5" />, color: "text-warning" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className={`h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart data={usageData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={planDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Páginas de Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <a href="/superuser/analytics/revenue" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
              Revenue Analytics
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
