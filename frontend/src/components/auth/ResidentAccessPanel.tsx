"use client";

import { Home, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MyAccessInfo } from "@/types/user";

interface ResidentAccessPanelProps {
  myAccess: MyAccessInfo[];
  loading: boolean;
  onSelect: (tenantId: number) => Promise<void>;
}

export function ResidentAccessPanel({ myAccess, loading, onSelect }: ResidentAccessPanelProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl border-border shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Selecciona tu propiedad</CardTitle>
          <CardDescription>Elige la propiedad a la que quieres acceder</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : myAccess.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tienes propiedades asignadas</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {myAccess.map((a) => (
                <button
                  key={`${a.tenant_id}-${a.unit_name}`}
                  onClick={() => onSelect(a.tenant_id)}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card text-left hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Home className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{a.tenant_name}</p>
                    {a.unit_name && <p className="text-sm text-muted-foreground">{a.unit_name}</p>}
                    <p className="text-xs text-muted-foreground capitalize mt-1">{a.access_type}</p>
                  </div>
                  <Check className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
