"use client";

import { useQuery } from "@tanstack/react-query";
import { financialApi } from "@/services/financial";
import { useUiStore } from "@/store/use-ui-store";

export function useFinancialEarnings() {
  const token = useUiStore((state) => state.token);
  return useQuery({
    queryKey: ["financial", "earnings"],
    queryFn: financialApi.earnings,
    enabled: Boolean(token),
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["financial", "transactions"],
    queryFn: financialApi.transactions,
  });
}
