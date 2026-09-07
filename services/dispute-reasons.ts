import { api, unwrapData } from "@/lib/api";
import type { DisputeReason, DisputeReasonInput } from "@/types";

const path = "/admin/dispute-reasons";
export const disputeReasonsApi = {
  async list() { const response = await api.get(path); const data = unwrapData<unknown>(response.data); const record = data as Record<string, unknown>; const reasons = Array.isArray(data) ? data : record.reasons ?? record.items ?? record.docs ?? record.data ?? []; return Array.isArray(reasons) ? reasons as DisputeReason[] : []; },
  async create(input: DisputeReasonInput) { const response = await api.post(path, input); return unwrapData<DisputeReason>(response.data); },
  async update(id: string, input: DisputeReasonInput) { const response = await api.patch(`${path}/${id}`, input); return unwrapData<DisputeReason>(response.data); },
};
