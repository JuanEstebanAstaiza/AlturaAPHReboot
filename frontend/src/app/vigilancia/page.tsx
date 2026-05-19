"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Search, UserCheck, UserX, ClipboardList } from "lucide-react";

export default function VigilanciaPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Control de Acceso</h1>
        <p className="text-muted-foreground">Módulo de vigilancia</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Visitante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Nombre, cédula o placa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">Buscar</Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entradas Hoy</CardTitle>
            <UserCheck className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">47</div>
            <p className="text-xs text-muted-foreground">+12 vs ayer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Salidas Hoy</CardTitle>
            <UserX className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">38</div>
            <p className="text-xs text-muted-foreground">-5 vs ayer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Predio</CardTitle>
            <Shield className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">9</div>
            <p className="text-xs text-muted-foreground">Visitantes activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Registro Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: "entrada", name: "Carlos Gómez", target: "Torre A, Apto 501", time: "14:32", status: "approved" },
              { type: "salida", name: "Ana Martínez", target: "Torre B, Apto 302", time: "14:15", status: "default" },
              { type: "entrada", name: "Delivery - Pizza Hut", target: "Torre A, Apto 701", time: "13:58", status: "approved" },
              { type: "entrada", name: "Roberto Díaz", target: "Torre C, Apto 105", time: "13:40", status: "pending" },
              { type: "entrada", name: "María López", target: "Torre B, Apto 204", time: "13:22", status: "approved" },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0">
                <Badge variant={log.status === "approved" ? "default" : log.status === "pending" ? "warning" : "secondary"}>
                  {log.type}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{log.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{log.target}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{log.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
