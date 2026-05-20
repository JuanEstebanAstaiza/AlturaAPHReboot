"use client";

import { useSuperuserAnalytics } from "@/hooks/useSuperuser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, BarChart } from "@/components/ui/chart";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function RevenueAnalyticsPage() {
  const { data: revenue, isLoading, error } = useSuperuserAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-alert">Error loading revenue data</p>
      </div>
    );
  }

  const monthlyRevenue = revenue?.monthly_revenue || [];
  const byPlan = revenue?.by_plan || [];

  const chartData = monthlyRevenue.length > 0
    ? monthlyRevenue.map((m: any) => ({ label: m.month || m.label, value: m.revenue || m.amount || m.count || 0 }))
    : [{ label: "No data", value: 0 }];

  const planData = byPlan.length > 0
    ? byPlan.map((p: any) => ({ label: p.plan || p.plan_name, value: p.revenue || p.count || p.amount || 0 }))
    : [{ label: "No data", value: 0 }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Revenue Analytics</h1>
        <p className="text-muted-foreground">Análisis de ingresos por plan de suscripción</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Ingresos Totales", value: formatCurrency(revenue?.total_revenue || 0), trend: "+18%", up: true, icon: <DollarSign className="h-5 w-5" /> },
          { label: "MRR", value: formatCurrency(revenue?.total_revenue || 0), trend: "+5%", up: true, icon: <TrendingUp className="h-5 w-5" /> },
          { label: "Churn Rate", value: "2.3%", trend: "-0.5%", up: true, icon: <TrendingDown className="h-5 w-5" /> },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart data={chartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={planData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
