"use client";

import { useQuery } from "@tanstack/react-query";
import { financialApi } from "@/services/financial";

export function useFinancialEarnings() {
  return useQuery({
    queryKey: ["financial", "earnings"],
    queryFn: financialApi.earnings,
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["financial", "transactions"],
    queryFn: financialApi.transactions,
  });
}
