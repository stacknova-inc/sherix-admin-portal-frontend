"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi, type UserAction } from "@/services/users";
import { useUiStore } from "@/store/use-ui-store";

export const usersQueryKey = ["users"] as const;

export function useUsers() {
  const token = useUiStore((state) => state.token);
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: usersApi.list,
    enabled: Boolean(token),
  });
}

export function useUser(id?: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => usersApi.get(id as string),
    enabled: Boolean(id),
  });
}


export function useUserAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: UserAction; reason?: string }) =>
      usersApi.action(id, action, reason ? { reason } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}
