"use client";

import { useState } from "react";
import { useSuperuserAudit } from "@/hooks/useSuperuser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

export default function AuditPage() {
  const { data: logs = [], isLoading, error } = useSuperuserAudit();
  const [search, setSearch] = useState("");

  const filtered = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.entity?.toLowerCase().includes(search.toLowerCase())
  );

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
        <p className="text-alert">Error loading audit logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs Global</h1>
          <p className="text-muted-foreground">Registro de actividad de todos los tenants</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar acción o entidad..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tenant</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acción</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Entidad</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground">#{l.id}</td>
                    <td className="py-3 px-4 text-foreground">#{l.tenant_id}</td>
                    <td className="py-3 px-4 text-foreground">#{l.user_id}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{l.action}</Badge>
                    </td>
                    <td className="py-3 px-4 text-foreground">{l.entity} #{l.entity_id}</td>
                    <td className="py-3 px-4 text-muted-foreground">{l.timestamp}</td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{l.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No se encontraron registros.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
