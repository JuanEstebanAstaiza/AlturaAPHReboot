"use client";

import { useState } from "react";
import { usePQRSTickets } from "@/hooks/usePQRS";
import { useFeatures } from "@/hooks/useFeatures";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PQRSType, PQRSStatus, PQRSPriority } from "@/types";
import { PQRS_STATUS_LABELS, PQRS_PRIORITY_LABELS, PQRS_TYPE_LABELS } from "@/types";
import { FileText, Plus, Clock, AlertCircle, CheckCircle, TrendingUp, Search } from "lucide-react";
import Link from "next/link";

export default function ResidentPQRSPage() {
  const { check } = useFeatures();
  const [search, setSearch] = useState("");

  if (!check("pqrs")) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Feature Not Available</h1>
          <p className="text-muted-foreground">El módulo PQRS no está disponible en tu plan actual.</p>
        </div>
      </div>
    );
  }

  const { data: tickets = [], isLoading } = usePQRSTickets(
    search ? { search, limit: 50 } : undefined
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis PQRS</h1>
          <p className="text-muted-foreground">Peticiones, Quejas, Reclamaciones y Sugerencias</p>
        </div>
        <Link href="/resident/pqrs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Ticket
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número o título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No hay tickets</p>
              <Link href="/resident/pqrs/new">
                <Button variant="link" className="mt-2">
                  Crear tu primera ticket
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket: any) => (
                <Link key={ticket.id} href={`/resident/pqrs/${ticket.id}`}>
                  <div className="p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono text-primary">{ticket.ticket_number}</span>
                          <Badge variant="secondary" className="text-xs">
                            {PQRS_TYPE_LABELS[ticket.type as PQRSType] || ticket.type}
                          </Badge>
                          <Badge
                            variant={
                              ticket.status === "open" ? "warning"
                                : ticket.status === "in_progress" ? "default"
                                : ticket.status === "escalated" ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {PQRS_STATUS_LABELS[ticket.status as PQRSStatus] || ticket.status}
                          </Badge>
                          <Badge
                            variant={
                              ticket.priority === "urgent" ? "destructive"
                                : ticket.priority === "high" ? "warning"
                                : ticket.priority === "medium" ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {PQRS_PRIORITY_LABELS[ticket.priority as PQRSPriority] || ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {ticket.created_at?.split("T")[0] || ticket.created_at}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
