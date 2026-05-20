"use client";

import { useState } from "react";
import { usePQRSTickets, usePQRSStats, usePQRSCategories } from "@/hooks/usePQRS";
import { useFeatures } from "@/hooks/useFeatures";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { PQRSType, PQRSStatus, PQRSPriority } from "@/types";
import { PQRS_STATUS_LABELS, PQRS_PRIORITY_LABELS, PQRS_TYPE_LABELS } from "@/types";
import { FileText, Plus, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function AdminPQRSPage() {
  const { check } = useFeatures();
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data: stats, isLoading: statsLoading } = usePQRSStats();
  const { data: tickets = [], isLoading: ticketsLoading } = usePQRSTickets(
    status || priority || search
      ? { status: status as any, priority: priority as any, search, limit: 50 }
      : undefined
  );
  const { data: categories = [] } = usePQRSCategories();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statsData = stats as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">PQRS</h1>
          <p className="text-muted-foreground">Peticiones, Quejas, Reclamaciones y Sugerencias</p>
        </div>
        <Link href="/admin/pqrs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Ticket
          </Button>
        </Link>
      </div>

      {/* Stats KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.total_tickets || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Abiertas</CardTitle>
            <Clock className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{statsData?.open_count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Progreso</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{statsData?.in_progress_count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Escaladas</CardTitle>
            <AlertCircle className="h-5 w-5 text-alert" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-alert">{statsData?.escalated_count || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar por número o título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={status} onValueChange={setStatus} placeholder="Estado">
              <SelectItem value="" label="Todos" />
              <SelectItem value="open" label="Abierta" />
              <SelectItem value="in_progress" label="En Progreso" />
              <SelectItem value="escalated" label="Escalada" />
              <SelectItem value="closed" label="Cerrada" />
            </Select>
            <Select value={priority} onValueChange={setPriority} placeholder="Prioridad">
              <SelectItem value="" label="Todas" />
              <SelectItem value="low" label="Baja" />
              <SelectItem value="medium" label="Media" />
              <SelectItem value="high" label="Alta" />
              <SelectItem value="urgent" label="Urgente" />
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {ticketsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No hay tickets que mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Número</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Título</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Prioridad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Creador</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Asignado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket: any) => (
                    <tr key={ticket.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-mono text-primary">{ticket.ticket_number}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge variant="secondary">{PQRS_TYPE_LABELS[ticket.type as PQRSType] || ticket.type}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{ticket.title}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge
                          variant={
                            ticket.status === "open" ? "warning"
                              : ticket.status === "in_progress" ? "default"
                              : ticket.status === "escalated" ? "destructive"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {PQRS_STATUS_LABELS[ticket.status as PQRSStatus] || ticket.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Badge
                          variant={
                            ticket.priority === "urgent" ? "destructive"
                              : ticket.priority === "high" ? "warning"
                              : ticket.priority === "medium" ? "default"
                              : "secondary"
                          }
                        >
                          {PQRS_PRIORITY_LABELS[ticket.priority as PQRSPriority] || ticket.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{ticket.created_by_name || "—"}</td>
                      <td className="py-3 px-4 text-sm">{ticket.assigned_to_name || "—"}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{ticket.created_at?.split("T")[0] || ticket.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
