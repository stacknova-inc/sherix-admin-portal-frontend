"use client";

import { useQuery } from "@tanstack/react-query";
import { financialApi } from "@/services/financial";
import { useUiStore } from "@/store/use-ui-store";

export function useFinancialEarnings(enabled = true) {
  const token = useUiStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["financial", "earnings"],
    queryFn: financialApi.earnings,
    enabled: Boolean(token) && enabled,
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["financial", "transactions"],
    queryFn: financialApi.transactions,
  });
}
