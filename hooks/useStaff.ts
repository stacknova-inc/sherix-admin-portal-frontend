"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffApi, type StaffStatusAction } from "@/services/staff";
import type { CreateStaffInput, StaffMember, UpdateStaffInput } from "@/types";

export type AuditEvent = {
  id: string;
  actionType: string;
  timestamp?: string;
  note?: string;
};

export const staffQueryKey = ["staff"] as const;

export function useStaffMembers() {
  return useQuery({
    queryKey: staffQueryKey,
    queryFn: () => staffApi.list(),
  });
}

export function useStaffMember(id?: string) {
  return useQuery<StaffMember>({
    queryKey: ["staff", id],
    queryFn: () => staffApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useStaffAuditLogs(staffId?: string) {
  return useQuery<AuditEvent[]>({
    queryKey: ["staff", "audit", staffId ?? "all"],
    queryFn: (): AuditEvent[] => [],
  });
}

export function useStaffNotifications(staffId?: string) {
  return useQuery<AuditEvent[]>({
    queryKey: ["staff", "notifications", staffId ?? "all"],
    queryFn: (): AuditEvent[] => [],
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStaffInput) => staffApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueryKey });
      queryClient.invalidateQueries({ queryKey: ["staff", "audit"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStaffInput }) =>
      staffApi.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffQueryKey });
      queryClient.invalidateQueries({ queryKey: ["staff", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["staff", "audit"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] });
    },
  });
}

export function useStaffStatusAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: StaffStatusAction }) =>
      staffApi.setStatus(id, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffQueryKey });
      queryClient.invalidateQueries({ queryKey: ["staff", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["staff", "audit"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] });
    },
  });
}

export function useResetStaffPassword() {
  return useMutation({
    mutationFn: async () => {
      throw new Error(
        "Staff password reset is not available in the backend contract.",
      );
    },
  });
}

export function useDeleteStaff() {
  return useMutation({
    mutationFn: async () => {
      throw new Error(
        "Staff deletion is not available in the backend contract.",
      );
    },
  });
}