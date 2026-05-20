"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateTicket } from "@/hooks/usePQRS";
import { useFeatures } from "@/hooks/useFeatures";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PQRS_TYPE_LABELS, PQRSType } from "@/types";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function ResidentNewPQRSTicketPage() {
  const router = useRouter();
  const { check } = useFeatures();
  const createMutation = useCreateTicket();

  const [type, setType] = useState<PQRSType>("p");
  const [priority, setPriority] = useState("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { type, priority, title, description },
      {
        onSuccess: (data: any) => {
          router.push(`/resident/pqrs/${data.id}`);
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/resident/pqrs">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva PQRS</h1>
          <p className="text-muted-foreground">Envía una petición, queja, reclamación o sugerencia</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Tipo</label>
                <Select value={type} onValueChange={(v) => setType(v as PQRSType)} placeholder="Tipo">
                  <SelectItem value="p" label={PQRS_TYPE_LABELS.p} />
                  <SelectItem value="q" label={PQRS_TYPE_LABELS.q} />
                  <SelectItem value="r" label={PQRS_TYPE_LABELS.r} />
                  <SelectItem value="s" label={PQRS_TYPE_LABELS.s} />
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Prioridad</label>
                <Select value={priority} onValueChange={setPriority} placeholder="Prioridad">
                  <SelectItem value="low" label="Baja" />
                  <SelectItem value="medium" label="Media" />
                  <SelectItem value="high" label="Alta" />
                  <SelectItem value="urgent" label="Urgente" />
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Título</label>
              <Input
                placeholder="Resumen breve del issue..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={300}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Descripción</label>
              <Textarea
                placeholder="Describe el issue en detalle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[120px]"
              />
            </div>

            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
              <p>La ticket será generada automáticamente con un número de seguimiento y asignada al administrador correspondiente.</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={createMutation.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Creando..." : "Enviar"}
              </Button>
              <Link href="/resident/pqrs">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
