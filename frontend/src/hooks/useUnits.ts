import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useUnitListings() {
  return useQuery({
    queryKey: ["units"],
    queryFn: () => api.units.listings(),
  });
}

export function useTowerList() {
  return useQuery({
    queryKey: ["towers"],
    queryFn: () => api.units.towers(),
  });
}

export function useTowerDetail(id: number) {
  return useQuery({
    queryKey: ["tower", id],
    queryFn: () => api.units.towerDetail(id),
    enabled: !!id,
  });
}

export function useCreateTower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string; floor_count: number }) =>
      api.units.createTower(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["towers"] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
}
