import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useResidentDirectory() {
  return useQuery({
    queryKey: ["residents"],
    queryFn: () => api.residents.directory(),
  });
}

export function useResidentProfile(userId: number) {
  return useQuery({
    queryKey: ["resident", userId],
    queryFn: () => api.residents.profile(userId),
    enabled: !!userId,
  });
}
