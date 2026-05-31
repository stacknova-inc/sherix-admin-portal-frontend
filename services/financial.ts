import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { FinancialEarnings, Transaction } from "@/types";

export const financialApi = {
  async earnings() {
    const response = await api.get("/financial/earnings");
    return unwrapData<FinancialEarnings>(response.data);
  },
  async transactions() {
    const response = await api.get("/financial/transactions");
    return unwrapArray<Transaction>(response.data);
  },
};
