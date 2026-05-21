"use client";

import { useState, useEffect } from "react";
import { useSuperuserTenants } from "@/hooks/useSuperuser";
import { useCreateAdmin } from "@/hooks/usePlans";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CheckCircle, AlertCircle, Users, Building2, Eye } from "lucide-react";
import Link from "next/link";

interface Tenant {
  id: number;
  name: string;
  address?: string;
  total_units: number;
  is_active: boolean;
}

interface AvailableUser {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
}

export default function SuperuserAdminsPage() {
  const { data: tenants = [], isLoading: tenantsLoading } = useSuperuserTenants();
  const createAdminMutation = useCreateAdmin();
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    id_number: "",
    tenant_id: 0,
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await api.superuser.availableUsers();
        setAvailableUsers(data);
      } catch {
        // Silent fail
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  const handleCreate = () => {
    if (!form.email.trim() || !form.password.trim() || !form.name.trim() || form.tenant_id === 0) return;
    createAdminMutation.mutate(form, {
      onSuccess: () => {
        setShowCreate(false);
        setForm({ email: "", password: "", name: "", phone: "", id_number: "", tenant_id: 0 });
        // Refresh available users
        api.superuser.availableUsers().then(setAvailableUsers);
      },
    });
  };

  const filteredTenants = tenants.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  if (tenantsLoading) {
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
          <h1 className="text-2xl font-bold text-foreground">Crear Administradores</h1>
          <p className="text-muted-foreground">Registrar nuevos usuarios admin y asignarlos a copropiedades</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Administrador
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Registrar Nuevo Administrador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Nombre completo</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan Perez" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Email</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="juan@ejemplo.com" type="email" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Password</label>
                <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimo 8 caracteres" type="password" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Telefono</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+57 300 123 4567" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Numero ID</label>
                <Input value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} placeholder="123456789" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Copropiedad</label>
                <select
                  value={form.tenant_id || ""}
                  onChange={(e) => setForm({ ...form, tenant_id: Number(e.target.value) })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="0">Seleccionar copropiedad...</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.total_units} unidades)</option>
                  ))}
                </select>
              </div>
            </div>
            {createAdminMutation.isError && (
              <p className="text-sm text-alert flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {createAdminMutation.error instanceof Error ? createAdminMutation.error.message : "Error al crear administrador"}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreate} disabled={createAdminMutation.isPending || !form.tenant_id}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {createAdminMutation.isPending ? "Creando..." : "Crear Administrador"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar copropiedad..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenants with their admins */}
      <Card>
        <CardHeader>
          <CardTitle>Copropiedades y Administradores ({filteredTenants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTenants.map((tenant: Tenant) => (
              <TenantCard key={tenant.id} tenant={tenant} />
            ))}
            {filteredTenants.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">No se encontraron copropiedades.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TenantCard({ tenant }: { tenant: Tenant }) {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(0);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [adminsData, usersData] = await Promise.all([
          api.superuser.admins(tenant.id),
          api.superuser.availableUsers(),
        ]);
        setAdmins(adminsData);
        setAvailableUsers(usersData);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tenant.id]);

  const handleAssign = async () => {
    if (selectedUserId === 0) return;
    setAssigning(true);
    try {
      await api.superuser.assignAdmin(tenant.id, selectedUserId);
      // Refresh
      const adminsData = await api.superuser.admins(tenant.id);
      setAdmins(adminsData);
      setShowAssign(false);
      setSelectedUserId(0);
    } catch (e: any) {
      alert(e.message || "Error al asignar");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 border rounded-lg flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/superuser/tenants/${tenant.id}`} className="font-bold text-foreground hover:underline flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {tenant.name}
            </Link>
            <Badge variant={tenant.is_active ? "default" : "destructive"}>{tenant.is_active ? "Activo" : "Inactivo"}</Badge>
            <Badge variant="secondary">{tenant.total_units} unidades</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{tenant.address || "—"}</p>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Administradores:</span>
          </div>
          {admins.length === 0 ? (
            <p className="text-xs text-muted-foreground ml-6">Sin administradores asignados</p>
          ) : (
            <div className="flex flex-wrap gap-2 ml-6">
              {admins.map((a: any) => (
                <Badge key={a.user_id} variant="default" className="text-xs">
                  {a.name || a.email}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/superuser/tenants/${tenant.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => setShowAssign(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Asignar Admin
          </Button>
        </div>
      </div>

      {/* Assign modal */}
      {showAssign && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
          <p className="text-sm font-medium mb-2">Seleccionar usuario para asignar como admin:</p>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="0">Seleccionar usuario...</option>
            {availableUsers.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <Button onClick={handleAssign} disabled={assigning || selectedUserId === 0} size="sm">
              {assigning ? "Asignando..." : "Asignar"}
            </Button>
            <Button variant="outline" onClick={() => setShowAssign(false)} size="sm">
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
