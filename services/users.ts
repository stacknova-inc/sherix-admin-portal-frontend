import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { User } from "@/types";

export type UserAction = "suspend" | "activate";

export const usersApi = {
  async list() {
    try {
      const response = await api.get("/users");
      return unwrapArray<User>(response.data);
    } catch (error) {
      console.warn("[Sherix Users] /users failed, retrying /users.", error);
      const response = await api.get("/users");
      return unwrapArray<User>(response.data);
    }
  },
  async get(id: string) {
    const response = await api.get(`/users/${id}`);
    return unwrapData<User>(response.data);
  },
  async action(id: string, action: UserAction, payload?: { reason?: string }) {
    const response = await api.patch(`/users/${id}/${action}`, payload);
    return unwrapData<User>(response.data);
  },
};
