"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePQRSTicket, usePQRSComments, useAddComment } from "@/hooks/usePQRS";
import { useFeatures } from "@/hooks/useFeatures";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { PQRSType, PQRSStatus, PQRSPriority } from "@/types";
import { PQRS_STATUS_LABELS, PQRS_PRIORITY_LABELS, PQRS_TYPE_LABELS } from "@/types";
import { ArrowLeft, Clock, User, Send, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ResidentPQRSTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { check } = useFeatures();
  const ticketId = Number(params.ticketId);

  const { data: ticket, isLoading: ticketLoading } = usePQRSTicket(ticketId);
  const { data: comments = [], isLoading: commentsLoading } = usePQRSComments(ticketId);
  const addCommentMutation = useAddComment();

  const [comment, setComment] = useState("");

  if (ticketLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const t = ticket as any;
  if (!t) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Ticket no encontrado</p>
          <Link href="/resident/pqrs">
            <Button className="mt-4">Volver a PQRS</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleComment = () => {
    if (!comment.trim()) return;
    addCommentMutation.mutate(
      { ticketId, message: comment.trim() },
      { onSuccess: () => setComment("") }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/resident/pqrs">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.ticket_number}</h1>
          <p className="text-muted-foreground">{t.title}</p>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex gap-2">
        <Badge variant="secondary">{PQRS_TYPE_LABELS[t.type as PQRSType] || t.type}</Badge>
        <Badge
          variant={
            t.status === "open" ? "warning"
              : t.status === "in_progress" ? "default"
              : t.status === "escalated" ? "destructive"
              : "secondary"
          }
        >
          {PQRS_STATUS_LABELS[t.status as PQRSStatus] || t.status}
        </Badge>
        <Badge
          variant={
            t.priority === "urgent" ? "destructive"
              : t.priority === "high" ? "warning"
              : t.priority === "medium" ? "default"
              : "secondary"
          }
        >
          {PQRS_PRIORITY_LABELS[t.priority as PQRSPriority] || t.priority}
        </Badge>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground whitespace-pre-wrap">{t.description}</p>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Creado por</p>
              <p className="font-medium">{t.created_by_name || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Asignado a</p>
              <p className="font-medium">{t.assigned_to_name || "Sin asignar"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fecha</p>
              <p className="font-medium">{t.created_at?.split("T")[0] || t.created_at}</p>
            </div>
            {t.closed_at && (
              <div>
                <p className="text-muted-foreground">Cerrado</p>
                <p className="font-medium">{t.closed_at?.split("T")[0] || t.closed_at}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Comentarios ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin comentarios aún</p>
            ) : (
              comments.map((c: any) => (
                <div key={c.id} className="flex gap-3 pb-4 border-b border-border last:border-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.user_name || "—"}</span>
                      <span className="text-xs text-muted-foreground">{c.created_at?.split("T")[0] || c.created_at}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{c.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="Agregar un comentario..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 min-h-[60px]"
            />
            <Button onClick={handleComment} className="self-start" disabled={!comment.trim() || addCommentMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
