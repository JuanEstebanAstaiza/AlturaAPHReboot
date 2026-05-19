"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { getStoredToken } from "@/lib/auth/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, BarChart } from "@/components/ui/chart";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function RevenueAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [byPlan, setByPlan] = useState<any[]>([]);

  useEffect(() => {
    const loadRevenue = async () => {
      try {
        const token = getStoredToken();
        if (!token) return;
        setRevenueData([
          { label: "Ene", value: 350000 },
          { label: "Feb", value: 380000 },
          { label: "Mar", value: 420000 },
          { label: "Abr", value: 450000 },
        ]);
        setByPlan([
          { label: "Free", value: 0 },
          { label: "Basic", value: 15000 },
          { label: "Professional", value: 25000 },
          { label: "Enterprise", value: 5000 },
        ]);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    loadRevenue();
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
        <h1 className="text-2xl font-bold text-foreground">Revenue Analytics</h1>
        <p className="text-muted-foreground">Análisis de ingresos por plan de suscripción</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Ingresos Totales", value: formatCurrency(1250000), trend: "+18%", up: true, icon: <DollarSign className="h-5 w-5" /> },
          { label: "MRR", value: formatCurrency(45000), trend: "+5%", up: true, icon: <TrendingUp className="h-5 w-5" /> },
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
            <AreaChart data={revenueData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={byPlan.length > 0 ? byPlan : [{ label: "Free", value: 0 }, { label: "Basic", value: 15000 }, { label: "Professional", value: 25000 }, { label: "Enterprise", value: 5000 }]} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
