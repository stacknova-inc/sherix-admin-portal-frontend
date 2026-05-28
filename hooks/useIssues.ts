"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { issuesApi } from "@/services/issues";
import type { CreateIssueInput, UpdateIssueInput } from "@/types";

export const issuesQueryKey = ["issues"] as const;

export function useIssues() {
  return useQuery({
    queryKey: issuesQueryKey,
    queryFn: issuesApi.list,
  });
}

export function useIssue(id?: string) {
  return useQuery({
    queryKey: ["issues", id],
    queryFn: () => issuesApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useAddIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIssueInput) => issuesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issuesQueryKey }),
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateIssueInput }) => issuesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issuesQueryKey }),
  });
}
