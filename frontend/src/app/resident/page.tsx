"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { getStoredToken } from "@/lib/auth/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, Wallet, Bell, Calendar, MessageSquare } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Property {
  id: number;
  name: string;
  tower: string;
  unit_number: string;
  plan: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  time: string;
}

export default function ResidentHomePage() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadResidentData = async () => {
      try {
        const token = getStoredToken();
        if (!token) return;

        const myAccess = await api.auth.myAccess();
        setProperties(
          myAccess?.map((p: any) => ({
            id: p.tenant_id || p.unit_id,
            name: p.tenant_name || p.property_name || "Mi Propiedad",
            tower: p.tower || "",
            unit_number: p.unit_number || "",
            plan: p.plan || "free",
          })) || []
        );

        setNotifications([
          { id: 1, title: "Pago confirmado", message: "Tu pago de $2,500,000 ha sido procesado", type: "success", time: "Hace 1 hora" },
          { id: 2, title: "Reunión de comité", message: "Próxima reunión el 15 de mayo", type: "info", time: "Hace 3 horas" },
          { id: 3, title: "Mantenimiento programado", message: "Elevador Torre B este viernes", type: "warning", time: "Hace 1 día" },
        ]);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    loadResidentData();
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
        <h1 className="text-2xl font-bold text-foreground">Portal del Residente</h1>
        <p className="text-muted-foreground">Bienvenido a tu panel de propiedad</p>
      </div>

      {/* Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Mis Propiedades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((p) => (
                <div key={p.id} className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.tower && `${p.tower}, `}Apto {p.unit_number}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">{p.plan}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tienes propiedades registradas.</p>
          )}
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
              { icon: <Wallet className="h-5 w-5" />, label: "Pagos", color: "bg-primary/10 text-primary" },
              { icon: <FileText className="h-5 w-5" />, label: "PQRS", color: "bg-accent/10 text-accent" },
              { icon: <Calendar className="h-5 w-5" />, label: "Reservas", color: "bg-warning/10 text-warning" },
              { icon: <MessageSquare className="h-5 w-5" />, label: "Comité", color: "bg-muted text-muted-foreground" },
            ].map((item) => (
              <button
                key={item.label}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary/50 transition-colors text-sm"
              >
                <div className={`h-10 w-10 rounded-lg ${item.color} flex items-center justify-center`}>{item.icon}</div>
                <span className="text-foreground font-medium">{item.label}</span>
              </button>
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
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
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
