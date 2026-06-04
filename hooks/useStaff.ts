"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffApi, type StaffStatusAction } from "@/services/staff";
import type { CreateStaffInput, UpdateStaffInput } from "@/types";

export const staffQueryKey = ["staff"] as const;

export function useStaffMembers() {
  return useQuery({
    queryKey: staffQueryKey,
    queryFn: staffApi.list,
  });
}

export function useStaffMember(id?: string) {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: () => staffApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useStaffAuditLogs(staffId?: string) {
  return useQuery({
    queryKey: ["staff", "audit", staffId ?? "all"],
    queryFn: () => staffApi.auditLogs(staffId),
  });
}

export function useStaffNotifications(staffId?: string) {
  return useQuery({
    queryKey: ["staff", "notifications", staffId ?? "all"],
    queryFn: () => staffApi.notifications(staffId),
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
    mutationFn: ({ id, input }: { id: string; input: UpdateStaffInput }) => staffApi.update(id, input),
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
    mutationFn: ({ id, action }: { id: string; action: StaffStatusAction }) => staffApi.setStatus(id, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffQueryKey });
      queryClient.invalidateQueries({ queryKey: ["staff", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["staff", "audit"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] });
    },
  });
}

export function useResetStaffPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffApi.resetPassword(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["staff", id] });
      queryClient.invalidateQueries({ queryKey: ["staff", "audit"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffApi.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueryKey });
      queryClient.invalidateQueries({ queryKey: ["staff", "audit"] });
    },
  });
}
