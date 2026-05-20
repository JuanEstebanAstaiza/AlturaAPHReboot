"use client";

import { useState } from "react";
import { useResidentDirectory } from "@/hooks/useResidents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Search, Plus } from "lucide-react";

export default function ResidentsPage() {
  const { data: residents = [], isLoading, error } = useResidentDirectory();
  const [search, setSearch] = useState("");

  const filtered = residents.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      (r.unit_number || "").toLowerCase().includes(search.toLowerCase())
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
        <p className="text-alert">Error loading residents</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Director de Residentes</h1>
          <p className="text-muted-foreground">Lista de residentes del conjunto</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Residente
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o apartamento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Residentes ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Avatar</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Apartamento</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.user_id || r.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <Avatar name={r.name || "User"} />
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{r.name || "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.email || "—"}</td>
                    <td className="py-3 px-4 text-foreground">{r.unit_number || r.tower || "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No se encontraron residentes.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
