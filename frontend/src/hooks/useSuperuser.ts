import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useSuperuserDashboard() {
  return useQuery({
    queryKey: ["superuser", "dashboard"],
    queryFn: () => api.superuser.dashboard(),
  });
}

export function useSuperuserTenants() {
  return useQuery({
    queryKey: ["superuser", "tenants"],
    queryFn: () => api.superuser.tenants(),
  });
}

export function useSuperuserTenant(id: number) {
  return useQuery({
    queryKey: ["superuser", "tenant", id],
    queryFn: () => api.superuser.tenantDetail(id),
    enabled: !!id,
  });
}

export function useUpdateTenantPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { tenantId: number; planId: number }) =>
      api.superuser.updatePlan(data.tenantId, data.planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superuser", "tenants"] });
      queryClient.invalidateQueries({ queryKey: ["superuser", "dashboard"] });
    },
  });
}

export function useSuperuserAudit() {
  return useQuery({
    queryKey: ["superuser", "audit"],
    queryFn: () => api.superuser.audit(),
  });
}

export function useSuperuserAnalytics() {
  return useQuery({
    queryKey: ["superuser", "analytics"],
    queryFn: () => api.superuser.revenue(),
  });
}
