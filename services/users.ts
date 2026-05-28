import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { User } from "@/types";

export type UserAction = "suspend" | "activate";

export const usersApi = {
  async list() {
    const response = await api.get("/users");
    return unwrapArray<User>(response.data);
  },
  async get(id: string) {
    const response = await api.get(`/users/${id}`);
    return unwrapData<User>(response.data);
  },
  async stats() {
    const response = await api.get("/users/stats");
    return unwrapData<Record<string, unknown>>(response.data);
  },
  async action(id: string, action: UserAction, payload?: { reason?: string }) {
    const response = await api.patch(`/users/${id}/${action}`, payload);
    return unwrapData<User>(response.data);
  },
};
