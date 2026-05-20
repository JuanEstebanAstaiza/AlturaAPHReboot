"use client";

import { useUnitListings, useTowerList, useCreateTower } from "@/hooks/useUnits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogOverlay, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Building2, Check } from "lucide-react";
import { useState } from "react";

export default function UnitsPage() {
  const { data: units = [], isLoading: loadingUnits } = useUnitListings();
  const { data: towers = [], isLoading: loadingTowers } = useTowerList();
  const createTower = useCreateTower();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [towerName, setTowerName] = useState("");
  const [towerCode, setTowerCode] = useState("");
  const [floorCount, setFloorCount] = useState("");

  const filtered = units.filter(
    (u) =>
      (u.unit_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.tower_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loadingUnits || loadingTowers) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Unidades y Torres</h1>
          <p className="text-muted-foreground">Gestión de unidades habitacionales</p>
        </div>
        {dialogOpen && (
          <>
            <DialogOverlay onClick={() => setDialogOpen(false)} />
            <DialogContent onOpenChange={setDialogOpen}>
              <DialogHeader>
                <DialogTitle>Crear Nueva Torre</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Nombre</label>
                  <Input value={towerName} onChange={(e) => setTowerName(e.target.value)} placeholder="Torre A" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Código</label>
                  <Input value={towerCode} onChange={(e) => setTowerCode(e.target.value)} placeholder="A" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Pisos</label>
                  <Input type="number" value={floorCount} onChange={(e) => setFloorCount(e.target.value)} placeholder="10" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    if (towerName && towerCode && floorCount) {
                      createTower.mutate({ name: towerName, code: towerCode, floor_count: Number(floorCount) });
                      setDialogOpen(false);
                      setTowerName("");
                      setTowerCode("");
                      setFloorCount("");
                    }
                  }}>
                    <Check className="h-4 w-4 mr-2" />
                    Crear
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                </div>
                {createTower.isError && <p className="text-sm text-alert">Error al crear torre</p>}
                {createTower.isSuccess && <p className="text-sm text-accent">Torre creada exitosamente</p>}
              </div>
            </DialogContent>
          </>
        )}
      </div>

      {/* Towers */}
      <Card>
        <CardHeader>
          <CardTitle>Torres ({towers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {towers.map((t) => (
              <div key={t.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">{t.name}</span>
                  <Badge variant="secondary">{t.code}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{t.floor_count || 0} pisos</p>
              </div>
            ))}
          </div>
          {towers.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No hay torres registradas.</p>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por apartamento o torre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Units */}
      <Card>
        <CardHeader>
          <CardTitle>Unidades ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Número</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Torre</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Piso</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{u.unit_number || "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground">{u.tower_name || "—"}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="capitalize">{u.unit_type_name || u.unit_type || "—"}</Badge>
                    </td>
                    <td className="py-3 px-4 text-foreground">{u.floor || "—"}</td>
                    <td className="py-3 px-4">
                      <Badge variant={u.occupied || u.status === "occupied" ? "default" : "secondary"} className="capitalize">
                        {u.status || (u.occupied ? "occupied" : "vacant")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No se encontraron unidades.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
