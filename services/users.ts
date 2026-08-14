import { api, assertApiId, unwrapArray, unwrapData } from "@/lib/api";
import type { User } from "@/types";

export type UserAction = "suspend" | "activate";

export const usersApi = {
  async list() {
    const response = await api.get("/users?role=customer");
    return unwrapArray<User>(response.data);
  },

  async get(id: string) {
    const userId = assertApiId(id, "User");
    const response = await api.get(`/users/${userId}`);
    return unwrapData<User>(response.data);
  },

  async action(
    id: string,
    action: UserAction,
    payload?: { reason?: string }
  ) {
    const userId = assertApiId(id, `User ${action}`);
    const verb = action === "activate" ? "reactivate" : "suspend";
    const endpoint = `/admin/verification/accounts/users/${verb}/${userId}`;

    const response = await api.patch(endpoint, payload);
    return unwrapData<User>(response.data);
  },
};
