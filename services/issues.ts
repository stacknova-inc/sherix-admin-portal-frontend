import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { CreateIssueInput, Issue, UpdateIssueInput } from "@/types";

export const issuesApi = {
  async list() {
    const response = await api.get("/issues");
    return unwrapArray<Issue>(response.data);
  },
  async get(id: string) {
    const response = await api.get(`/issues/${id}`);
    return unwrapData<Issue>(response.data);
  },
  async create(payload: CreateIssueInput) {
    const response = await api.post("/issues", payload);
    return unwrapData<Issue>(response.data);
  },
  async update(id: string, payload: UpdateIssueInput) {
    const response = await api.patch(`/issues/${id}`, payload);
    return unwrapData<Issue>(response.data);
  },
};
