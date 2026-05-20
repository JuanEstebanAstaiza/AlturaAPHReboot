"use client";

import { useTenantStore } from "@/lib/auth/tenant-store";
import { useUnitListings } from "@/hooks/useUnits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, Wallet, Bell, Calendar, MessageSquare } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useEffect } from "react";

export default function ResidentHomePage() {
  const { init } = useTenantStore();
  const { data: units = [], isLoading } = useUnitListings();

  useEffect(() => {
    init();
  }, [init]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentUnit = units[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Portal del Residente</h1>
        <p className="text-muted-foreground">Bienvenido a tu panel de propiedad</p>
      </div>

      {/* Unit Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Tu Unidad
          </CardTitle>
          <Badge variant="secondary" className="capitalize">
            {currentUnit?.unit_type_name || currentUnit?.unit_type || "Apto"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Apartamento</p>
              <p className="text-lg font-bold text-foreground">{currentUnit?.unit_number || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Torre</p>
              <p className="text-lg font-bold text-foreground">{currentUnit?.tower_name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Piso</p>
              <p className="text-lg font-bold text-foreground">{currentUnit?.floor || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <Badge variant={currentUnit?.occupied ? "default" : "secondary"} className="capitalize">
                {currentUnit?.status || (currentUnit?.occupied ? "occupied" : "vacant")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <Wallet className="h-5 w-5" />, label: "Pagos", color: "bg-primary/10 text-primary", href: "#" },
              { icon: <MessageSquare className="h-5 w-5" />, label: "PQRS", color: "bg-accent/10 text-accent", href: "/resident/pqrs" },
              { icon: <Calendar className="h-5 w-5" />, label: "Reservas", color: "bg-warning/10 text-warning", href: "/resident/reservas" },
              { icon: <FileText className="h-5 w-5" />, label: "Documentos", color: "bg-muted text-muted-foreground", href: "/resident/documents" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary/50 transition-colors text-sm"
              >
                <div className={`h-10 w-10 rounded-lg ${item.color} flex items-center justify-center`}>{item.icon}</div>
                <span className="text-foreground font-medium">{item.label}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: "Pago confirmado", message: "Tu pago ha sido procesado exitosamente", type: "success", time: "Hace 1 hora" },
              { title: "Reunión de comité", message: "Próxima reunión el 15 de mayo", type: "info", time: "Hace 3 horas" },
              { title: "Mantenimiento programado", message: "Elevador Torre B este viernes", type: "warning", time: "Hace 1 día" },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <Badge variant={n.type === "success" ? "default" : n.type === "warning" ? "warning" : "secondary"}>
                  {n.type}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
