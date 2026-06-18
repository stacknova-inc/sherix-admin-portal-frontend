import { api, unwrapArray } from "@/lib/api";
import type { AdminNotification } from "@/types";

export const notificationsApi = {
  async list() {
    const response = await api.get("/admin/notifications");
    return unwrapArray<AdminNotification>(response.data);
  },
};
