"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { getStoredToken } from "@/lib/auth/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, PieChart } from "@/components/ui/chart";
import { Users, Building2, TrendingUp, DollarSign } from "lucide-react";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const token = getStoredToken();
        if (!token) return;
        const usage = await api.units.listings();
        setUsageData([
          { label: "Ene", value: 800 },
          { label: "Feb", value: 900 },
          { label: "Mar", value: 1050 },
          { label: "Abr", value: 1200 },
        ]);
        setPlanDistribution([
          { label: "Free", value: 40 },
          { label: "Basic", value: 30 },
          { label: "Professional", value: 20 },
          { label: "Enterprise", value: 10 },
        ]);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
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
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Análisis de uso global</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Usuarios", value: "1,234", icon: <Users className="h-5 w-5" />, color: "text-primary" },
          { label: "Total Tenants", value: "100", icon: <Building2 className="h-5 w-5" />, color: "text-accent" },
          { label: "Crecimiento", value: "+12%", icon: <TrendingUp className="h-5 w-5" />, color: "text-accent" },
          { label: "MRR", value: "$45,000", icon: <DollarSign className="h-5 w-5" />, color: "text-warning" },
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
            <PieChart data={planDistribution.length > 0 ? planDistribution : [{ label: "Free", value: 40 }, { label: "Basic", value: 30 }, { label: "Professional", value: 20 }, { label: "Enterprise", value: 10 }]} />
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
