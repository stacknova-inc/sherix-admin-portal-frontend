import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { AdCampaign, CreateAdCampaignInput, UpdateAdCampaignInput } from "@/types";

function campaignFormData(payload: CreateAdCampaignInput | UpdateAdCampaignInput) {
  const formData = new FormData();
  if (payload.image) formData.append("image", payload.image);
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.startDate !== undefined) formData.append("startDate", payload.startDate);
  if (payload.endDate !== undefined) formData.append("endDate", payload.endDate);
  return formData;
}

export const adCampaignsApi = {
  async list() {
    const response = await api.get("/admin/ad-campaigns");
    return unwrapArray<AdCampaign>(response.data);
  },
  async get(id: string) {
    const response = await api.get(`/admin/ad-campaigns/${id}`);
    return unwrapData<AdCampaign>(response.data);
  },
  async create(payload: CreateAdCampaignInput, onUploadProgress?: (percent: number) => void) {
    const response = await api.post("/admin/ad-campaigns", campaignFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total) onUploadProgress?.(Math.round((event.loaded * 100) / event.total));
      },
    });
    return unwrapData<AdCampaign>(response.data);
  },
  async update(id: string, payload: UpdateAdCampaignInput, onUploadProgress?: (percent: number) => void) {
    const response = await api.patch(`/admin/ad-campaigns/${id}`, campaignFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total) onUploadProgress?.(Math.round((event.loaded * 100) / event.total));
      },
    });
    return unwrapData<AdCampaign>(response.data);
  },
  async toggleStatus(id: string) {
    const response = await api.patch(`/admin/ad-campaigns/${id}/toggle-status`);
    return unwrapData<AdCampaign>(response.data);
  },
  async remove(id: string) {
    const response = await api.delete(`/admin/ad-campaigns/${id}`);
    return unwrapData<AdCampaign>(response.data);
  },
};
