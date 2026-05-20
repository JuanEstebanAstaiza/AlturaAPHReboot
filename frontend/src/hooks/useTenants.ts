import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useTenantDetail(id: number) {
  return useQuery({
    queryKey: ["tenant", id],
    queryFn: () => api.tenants.detail(id),
    enabled: !!id,
  });
}

export function useTenantUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; planId: number }) =>
      api.tenants.updatePlan(data.id, data.planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}
