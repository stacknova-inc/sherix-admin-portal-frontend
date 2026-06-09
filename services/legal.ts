import { api, unwrapArray, unwrapData } from "@/lib/api";
import type { LegalDocument } from "@/types";

const LEGAL_DOCUMENTS_ENDPOINT = "/legal/pdf";
const LEGAL_UPSERT_ENDPOINT = "/admin/legal";

export function normalizeLegalDocuments(response: unknown): LegalDocument[] {
  const documents = unwrapArray<LegalDocument>(response);
  if (documents.length) return documents;

  const data = unwrapData<unknown>(response);
  if (!data) return [];

  if (typeof data === "string") {
    return [{ documentName: "Legal document", fileUrl: data }];
  }

  if (typeof data !== "object") return [];

  const record = data as Record<string, unknown>;
  for (const key of ["legal", "legalContent", "legalDocument", "document", "pdf", "file"]) {
    const value = record[key];
    if (Array.isArray(value)) return value as LegalDocument[];
    if (typeof value === "string") return [{ documentName: "Legal document", fileUrl: value }];
    if (value && typeof value === "object") return [value as LegalDocument];
  }

  return [record as LegalDocument];
}

export const legalApi = {
  async list() {
    const response = await api.get(LEGAL_DOCUMENTS_ENDPOINT);
    return normalizeLegalDocuments(response.data);
  },
  async upload(document: File, onUploadProgress?: (percent: number) => void) {
    const formData = new FormData();
    formData.append("document", document);
    const response = await api.put(LEGAL_UPSERT_ENDPOINT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total) onUploadProgress?.(Math.round((event.loaded * 100) / event.total));
      },
    });
    return normalizeLegalDocuments(response.data)[0] ?? unwrapData<LegalDocument>(response.data);
  },
};
