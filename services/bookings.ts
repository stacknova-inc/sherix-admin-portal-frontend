import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { Booking } from "@/types";

export const bookingsApi = {
  async list(params?: Record<string, string | number | undefined>) {
    const response = await api.get("/bookings/admin/bookings", { params });
    return unwrapArray<Booking>(response.data);
  },
  async stats() {
    const response = await api.get("/bookings/admin/bookings/stats");
    return unwrapData<Record<string, unknown>>(response.data);
  },
};
