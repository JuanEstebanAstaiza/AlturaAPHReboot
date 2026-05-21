"use client";

import { useState } from "react";
import { usePlans, useCreatePlan, useUpdatePlan, useDeactivatePlan } from "@/hooks/usePlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Save, X, Trash2, CheckCircle, AlertCircle } from "lucide-react";

export default function SuperuserPlansPage() {
  const { data: plans = [], isLoading } = usePlans();
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const deactivateMutation = useDeactivatePlan();
  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState<{ name: string; code: string; description: string; max_tenants: number; max_residents: number; monthly_price: number; features: Record<string, boolean> }>({
    name: "",
    code: "",
    description: "",
    max_tenants: 1,
    max_residents: 10,
    monthly_price: 0,
    features: { pqrs: true, documents: true, resident_portal: true, admin_dashboard: true },
  });

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      description: "",
      max_tenants: 1,
      max_residents: 10,
      monthly_price: 0,
      features: { pqrs: true, documents: true, resident_portal: true, admin_dashboard: true },
    });
  };

  const startEdit = (plan: any) => {
    setForm({
      name: plan.name,
      code: plan.code,
      description: plan.description || "",
      max_tenants: plan.max_tenants,
      max_residents: plan.max_residents,
      monthly_price: plan.monthly_price,
      features: plan.features || {},
    });
    setEditingPlan(plan.id);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) return;
    updateMutation.mutate({ planId: editingPlan!, data: form }, {
      onSuccess: () => {
        setEditingPlan(null);
        resetForm();
      },
    });
  };

  const handleCreate = () => {
    if (!form.name.trim() || !form.code.trim()) return;
    createMutation.mutate(form, {
      onSuccess: () => {
        setShowCreate(false);
        resetForm();
      },
    });
  };

  const handleDeactivate = (planId: number) => {
    if (!confirm("Desactivar este plan? Los tenants activos mantendran su suscripcion.")) return;
    deactivateMutation.mutate(planId);
  };

  const toggleFeature = (key: string) => {
    setForm((prev) => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] },
    }));
  };

  const featureOptions = [
    { key: "pqrs", label: "PQRS" },
    { key: "documents", label: "Documentos" },
    { key: "resident_portal", label: "Portal Residentes" },
    { key: "admin_dashboard", label: "Dashboard Admin" },
    { key: "reservations", label: "Reservas" },
    { key: "assemblies", label: "Asambleas" },
    { key: "convivencia", label: "Convivencia" },
    { key: "financial", label: "Financiero" },
    { key: "access", label: "Acceso/Vigilancia" },
    { key: "superuser_access", label: "Acceso Superuser" },
  ];

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-foreground">Planes de Suscripcion</h1>
          <p className="text-muted-foreground">Crear y gestionar planes con limites de copropiedades y usuarios</p>
        </div>
        <Button onClick={() => { setShowCreate(true); resetForm(); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Plan
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear Nuevo Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Nombre</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Professional" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Codigo</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase() })} placeholder="Ej: professional" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Max Copropiedades</label>
                <Input type="number" min={1} value={form.max_tenants} onChange={(e) => setForm({ ...form, max_tenants: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Max Residentes</label>
                <Input type="number" min={1} value={form.max_residents} onChange={(e) => setForm({ ...form, max_residents: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Precio Mensual ($)</label>
                <Input type="number" min={0} value={form.monthly_price} onChange={(e) => setForm({ ...form, monthly_price: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Descripcion</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripcion del plan" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Modulos Incluidos</label>
              <div className="flex flex-wrap gap-2">
                {featureOptions.map(({ key, label }) => (
                  <Badge
                    key={key}
                    variant={form.features[key] ? "default" : "secondary"}
                    className="cursor-pointer px-3 py-1 text-sm"
                    onClick={() => toggleFeature(key)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Creando..." : "Crear Plan"}
              </Button>
              <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans list */}
      <Card>
        <CardHeader>
          <CardTitle>Planes Existentes ({plans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.map((plan: any) => (
              <div key={plan.id} className={`p-4 rounded-lg border ${editingPlan === plan.id ? "border-primary bg-primary/5" : "border-border"}`}>
                {editingPlan === plan.id ? (
                  /* Edit mode */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Nombre</label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Max Copropiedades</label>
                        <Input type="number" min={1} value={form.max_tenants} onChange={(e) => setForm({ ...form, max_tenants: Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Max Residentes</label>
                        <Input type="number" min={1} value={form.max_residents} onChange={(e) => setForm({ ...form, max_residents: Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Precio Mensual ($)</label>
                        <Input type="number" min={0} value={form.monthly_price} onChange={(e) => setForm({ ...form, monthly_price: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Modulos</label>
                      <div className="flex flex-wrap gap-2">
                        {featureOptions.map(({ key, label }) => (
                          <Badge
                            key={key}
                            variant={form.features[key] ? "default" : "secondary"}
                            className="cursor-pointer px-3 py-1 text-sm"
                            onClick={() => toggleFeature(key)}
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateMutation.isPending ? "Guardando..." : "Guardar"}
                      </Button>
                      <Button variant="outline" onClick={() => { setEditingPlan(null); resetForm(); }}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground">{plan.name}</span>
                        <Badge variant={plan.status ? "default" : "secondary"}>{plan.status ? "Activo" : "Desactivado"}</Badge>
                        <Badge variant="secondary">{plan.code}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{plan.description || "—"}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Copropiedades: <strong className="text-foreground">{plan.max_tenants}</strong></span>
                        <span>Residentes: <strong className="text-foreground">{plan.max_residents}</strong></span>
                        <span>Precio: <strong className="text-foreground">{plan.monthly_price === 0 ? "Gratis" : `$${plan.monthly_price.toLocaleString()}`}</strong></span>
                        <span>Tenants activos: <strong className="text-foreground">{plan.active_tenants || 0}</strong></span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(plan.features || {}).filter(([_, v]) => v).map(([key]) => (
                          <Badge key={key} variant="default" className="text-xs capitalize">{key.replace(/_/g, " ")}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!plan.status && (
                        <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(plan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {plan.status && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-alert" onClick={() => handleDeactivate(plan.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {plans.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">No hay planes de suscripcion.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
