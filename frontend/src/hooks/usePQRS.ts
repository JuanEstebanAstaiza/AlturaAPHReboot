"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  PQRSTicket,
  PQRSTicketList,
  PQRSComment,
  PQRSCategory,
  PQRSStats,
  PQRSStatus,
  PQRSPriority,
  PQRSType,
} from "@/types";

export function usePQRSTickets(params?: {
  status?: PQRSStatus;
  priority?: PQRSPriority;
  type?: PQRSType;
  assigned_to?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["pqrs-tickets", params],
    queryFn: () => api.pqrs.tickets(params as Record<string, string>),
    staleTime: 30_000,
  });
}

export function usePQRSTicket(id: number | undefined) {
  return useQuery({
    queryKey: ["pqrs-ticket", id],
    queryFn: () => api.pqrs.ticket(id!),
    enabled: id !== undefined,
  });
}

export function usePQRSStats() {
  return useQuery({
    queryKey: ["pqrs-stats"],
    queryFn: () => api.pqrs.stats(),
    staleTime: 60_000,
  });
}

export function usePQRSCategories() {
  return useQuery({
    queryKey: ["pqrs-categories"],
    queryFn: () => api.pqrs.categories(),
    staleTime: 300_000,
  });
}

export function usePQRSComments(ticketId: number | undefined) {
  return useQuery({
    queryKey: ["pqrs-comments", ticketId],
    queryFn: () => api.pqrs.comments(ticketId!),
    enabled: ticketId !== undefined,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: Record<string, string>) => api.pqrs.createTicket(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pqrs-tickets"] });
      qc.invalidateQueries({ queryKey: ["pqrs-stats"] });
    },
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: PQRSStatus }) =>
      api.pqrs.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["pqrs-tickets"] });
      qc.invalidateQueries({ queryKey: ["pqrs-ticket", variables.id] });
      qc.invalidateQueries({ queryKey: ["pqrs-stats"] });
    },
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: number }) =>
      api.pqrs.assignTicket(id, userId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["pqrs-tickets"] });
      qc.invalidateQueries({ queryKey: ["pqrs-ticket", variables.id] });
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: number; message: string }) =>
      api.pqrs.addComment(ticketId, message),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["pqrs-comments", variables.ticketId] });
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: Record<string, string | number | undefined>) =>
      api.pqrs.createCategory(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pqrs-categories"] });
    },
  });
}
