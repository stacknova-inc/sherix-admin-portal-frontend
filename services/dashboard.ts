import { api, unwrapData } from "@/lib/api";
import type { DashboardAnalytics, DashboardSummary } from "@/types";

export const dashboardApi = {
  async summary() {
    const response = await api.get("/dashboard/summary");
    return unwrapData<DashboardSummary>(response.data);
  },
  async analytics(range = "30D") {
    const response = await api.get("/dashboard/analytics", { params: { range } });
    return unwrapData<DashboardAnalytics>(response.data);
  },
};
