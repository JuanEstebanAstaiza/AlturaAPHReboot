"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { getStoredToken } from "@/lib/auth/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, PieChart } from "@/components/ui/chart";
import { Building2, Users, DollarSign, AlertCircle, Globe, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function SuperuserDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = getStoredToken();
        if (!token) return;

        const tenants = await api.superuser.tenants();
        setKpiData([
          {
            label: "Tenants Totales",
            value: tenants.length.toString(),
            change: "+3 this month",
            trend: "up",
            icon: <Globe className="h-5 w-5" />,
          },
          {
            label: "Unidades Globales",
            value: "100",
            change: "+15 this quarter",
            trend: "up",
            icon: <Building2 className="h-5 w-5" />,
          },
          {
            label: "Residentes",
            value: "1,234",
            change: "+28 this month",
            trend: "up",
            icon: <Users className="h-5 w-5" />,
          },
          {
            label: "Ingresos Totales",
            value: formatCurrency(1250000),
            change: "+18%",
            trend: "up",
            icon: <DollarSign className="h-5 w-5" />,
          },
        ]);

        setChartData([
          { label: "Free", value: 0 },
          { label: "Basic", value: 150000 },
          { label: "Professional", value: 350000 },
          { label: "Enterprise", value: 750000 },
        ]);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Superuser Dashboard</h1>
        <p className="text-muted-foreground">Vista global de todos los tenants</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
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
                <TrendingUp className="h-3 w-3 text-accent" />
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
            <AreaChart data={chartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={[{ label: "Enterprise", value: 15 }, { label: "Professional", value: 30 }, { label: "Basic", value: 45 }, { label: "Free", value: 10 }]} />
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
            {[
              { label: "Active", count: 85, color: "text-accent" },
              { label: "Pending", count: 5, color: "text-warning" },
              { label: "Expired", count: 3, color: "text-alert" },
              { label: "Cancelled", count: 2, color: "text-muted-foreground" },
            ].map((item) => (
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
            {[
              { alert: "Suscripción expirada", detail: "Tenant #42 - Plan Basic expirado", severity: "warning" },
              { alert: "Cartera crítica", detail: "Tenant #15 - 35% pagos vencidos", severity: "destructive" },
              { alert: "Nuevo tenant", detail: "Residente #89 - Nueva cuenta creada", severity: "default" },
              { alert: "Usage limit", detail: "Tenant #28 - 90% de límites de unidades", severity: "warning" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0">
                <Badge variant={item.severity === "destructive" ? "destructive" : item.severity === "warning" ? "warning" : "secondary"}>
                  {item.severity}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.alert}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
