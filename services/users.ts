import { api, assertApiId, unwrapArray, unwrapData } from "@/lib/api";
import type { User } from "@/types";

export type UserAction = "suspend" | "activate";

export const usersApi = {
  async list() {
    const response = await api.get("/users");
    return unwrapArray<User>(response.data);
  },
  async get(id: string) {
    const userId = assertApiId(id, "User");
    const response = await api.get(`/users/${userId}`);
    return unwrapData<User>(response.data);
  },
  async action(id: string, action: UserAction, payload?: { reason?: string }) {
    const userId = assertApiId(id, `User ${action}`);
    const response = await api.patch(`/users/${userId}/${action}`, payload);
    return unwrapData<User>(response.data);
  },
};
