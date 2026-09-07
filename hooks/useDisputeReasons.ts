"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { disputeReasonsApi } from "@/services/dispute-reasons";
import type { DisputeReasonInput } from "@/types";

const key = ["dispute-reasons"] as const;
export function useDisputeReasons() { return useQuery({ queryKey: key, queryFn: disputeReasonsApi.list }); }
export function useCreateDisputeReason() { const client = useQueryClient(); return useMutation({ mutationFn: (input: DisputeReasonInput) => disputeReasonsApi.create(input), onSuccess: () => client.invalidateQueries({ queryKey: key }) }); }
export function useUpdateDisputeReason() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: DisputeReasonInput }) => disputeReasonsApi.update(id, input), onSuccess: () => client.invalidateQueries({ queryKey: key }) }); }
