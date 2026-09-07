import { api, unwrapArray } from "@/lib/api";
import type { AdminNotification, BroadcastNotificationInput, BroadcastNotificationResult } from "@/types";

export const notificationsApi = {
  async list() {
    const response = await api.get("/admin/notifications");
    return unwrapArray<AdminNotification>(response.data);
  },
  async broadcast(input: BroadcastNotificationInput, idempotencyKey?: string) {
    const response = await api.post("/admin/notifications/broadcast", input, { idempotencyKey });
    return response.data as BroadcastNotificationResult;
  },
};
