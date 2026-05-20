"use client";

import { useUnitListings, useTowerList } from "@/hooks/useUnits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, PieChart } from "@/components/ui/chart";
import { Building2, Users, DollarSign, AlertCircle, TrendingUp, TrendingDown, FileText, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data: units = [], isLoading: loadingUnits } = useUnitListings();
  const { data: towers = [], isLoading: loadingTowers } = useTowerList();

  if (loadingUnits || loadingTowers) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const occupied = units.filter((u) => u.occupied || u.status === "occupied").length;
  const vacant = units.length - occupied;

  const kpis = [
    {
      label: "Unidades Totales",
      value: units.length.toString(),
      change: "+2 this month",
      trend: "up" as const,
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      label: "Torres",
      value: towers.length.toString(),
      change: "0 new",
      trend: "up" as const,
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Ocupadas",
      value: occupied.toString(),
      change: `${((occupied / (units.length || 1)) * 100).toFixed(0)}%`,
      trend: "up" as const,
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      label: "Vacías",
      value: vacant.toString(),
      change: "—",
      trend: "down" as const,
      icon: <AlertCircle className="h-5 w-5" />,
    },
  ];

  const chartData = [
    { label: "Ene", value: 2000000 },
    { label: "Feb", value: 2200000 },
    { label: "Mar", value: 2100000 },
    { label: "Abr", value: 2500000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de tu propiedad</p>
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
            <CardTitle>Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart data={chartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Unidades</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={units.length > 0 ? [{ label: "Ocupadas", value: occupied }, { label: "Vacías", value: vacant }] : [{ label: "No data", value: 0 }]} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <a href="/admin/units" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
              <Plus className="h-4 w-4" />
              Nueva Unidad
            </a>
            <a href="/admin/residents" className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm">
              <Users className="h-4 w-4" />
              Registrar Residente
            </a>
            <span className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg text-sm opacity-50 cursor-not-allowed">
              <FileText className="h-4 w-4" />
              Generar Reporte
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Pago recibido", detail: "Apto 1201 - $2,500,000", time: "Hace 2 horas", status: "success" },
              { action: "PQRS creada", detail: "Juan Pérez - Reporte de fuga", time: "Hace 5 horas", status: "warning" },
              { action: "Residente nuevo", detail: "María López - Torre B, Apto 805", time: "Hace 1 día", status: "default" },
              { action: "Cuota actualizada", detail: "Apto 402 - $1,800,000 → $1,850,000", time: "Hace 2 días", status: "default" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0">
                <Badge variant={item.status === "success" ? "default" : item.status === "warning" ? "warning" : "secondary"} className="capitalize">
                  {item.status}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
