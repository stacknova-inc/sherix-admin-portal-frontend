"use client";

import { useQuery } from "@tanstack/react-query";
import { financialApi } from "@/services/financial";
import { useUiStore } from "@/store/use-ui-store";
import type { TransactionListParams } from "@/types";

export function useFinancialEarnings(enabled = true) {
  const token = useUiStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["financial", "earnings"],
    queryFn: financialApi.earnings,
    enabled: Boolean(token) && enabled,
  });
}

export function useTransactions(params?: TransactionListParams) {
  const token = useUiStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["financial", "transactions", params],
    queryFn: () => financialApi.transactions(params),
    enabled: Boolean(token),
  });
}
