import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function usePlans() {
  return useQuery({
    queryKey: ["superuser", "plans"],
    queryFn: () => api.superuser.plans(),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string; description?: string; max_tenants: number; max_residents: number; features: Record<string, boolean>; monthly_price: number }) =>
      api.superuser.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superuser", "plans"] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }: { planId: number; data: Record<string, any> }) =>
      api.superuser.updatePlanDef(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superuser", "plans"] });
    },
  });
}

export function useDeactivatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: number) => api.superuser.deactivatePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superuser", "plans"] });
    },
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string; phone?: string; id_number?: string; tenant_id: number }) =>
      api.superuser.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superuser", "tenants"] });
    },
  });
}
