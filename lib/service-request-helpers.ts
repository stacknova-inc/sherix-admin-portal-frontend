import { asRecord, firstText, formatStatusLabel, recordId, text } from "@/lib/live-data";
import type { ServiceRequest } from "@/types";

export function serviceRequestDisplayId(request: ServiceRequest) {
  return request.requestId || request.jobId || recordId(request);
}


export function pickNewerServiceRequest(current: ServiceRequest | undefined, incoming: ServiceRequest): ServiceRequest {
  if (!current) return incoming;

  const currentTime = Date.parse(String(current.updatedAt ?? ""));
  const incomingTime = Date.parse(String(incoming.updatedAt ?? ""));

  if (Number.isFinite(currentTime) && Number.isFinite(incomingTime) && currentTime > incomingTime) {
    return current;
  }
  return incoming;
}

export type PartySummary = {
  id: string;
  name: string;
  phone: string;
  businessName: string;
  photoUrl: string;
};

export function partySummary(reference: unknown, fallbackName?: string): PartySummary {
  const record = asRecord(reference);
  const photo = asRecord(record.profilePhoto);

  return {
    id: firstText(record, ["_id", "id"], typeof reference === "string" ? reference : ""),
    name: firstText(record, ["name", "fullName"], fallbackName ?? "-"),
    phone: firstText(record, ["phone", "phoneNumber"], "-"),
    businessName: firstText(record, ["businessName", "companyName"], ""),
    photoUrl: firstText(photo.url ? photo : record, ["url", "profilePhotoUrl"], ""),
  };
}

export function isPopulatedReference(reference: unknown) {
  return Boolean(reference) && typeof reference === "object";
}

export function resolveServiceName(serviceRef: unknown, services: Array<{ _id?: string; id?: string; name?: string; title?: string }>) {
  if (isPopulatedReference(serviceRef)) {
    const name = firstText(serviceRef as Record<string, unknown>, ["name", "title"], "");
    if (name) return name;
  }
  const id = typeof serviceRef === "string" ? serviceRef : firstText(asRecord(serviceRef), ["_id", "id"], "");
  if (!id) return "-";
  const match = services.find((service) => (service._id ?? service.id) === id);
  return match ? firstText(match as Record<string, unknown>, ["name", "title"], "-") : "-";
}


export function resolveCompany(companyRef: unknown, companies: unknown[]): PartySummary | null {
  if (isPopulatedReference(companyRef)) {
    const record = companyRef as Record<string, unknown>;
    const name = firstText(record, ["name", "companyName", "businessName"], "");
    if (name) return partySummary(record, name);
  }
  const id = typeof companyRef === "string" ? companyRef : firstText(asRecord(companyRef), ["_id", "id", "companyId"], "");
  if (!id) return null;
  const match = companies
    .map((company) => asRecord(company))
    .find((company) => [company._id, company.id, company.companyId].map(String).includes(id));
  return match ? partySummary(match, firstText(match, ["name", "companyName", "businessName"], "")) : null;
}

export function priceSummary(request: ServiceRequest, formatMoney: (value: unknown) => string) {
  if (typeof request.finalCost === "number") return formatMoney(request.finalCost);
  if (typeof request.mechanicSuggestedPrice === "number") return formatMoney(request.mechanicSuggestedPrice);
  const { originalIssueMinPrice: min, originalIssueMaxPrice: max } = request;
  if (typeof min === "number" && typeof max === "number") return `${formatMoney(min)} - ${formatMoney(max)}`;
  if (typeof min === "number" || typeof max === "number") return formatMoney(min ?? max);
  return "-";
}

export type NormalizedPriceUpdate = {
  key: string;
  amount: number | null;
  status: string;
  note: string;
  actor: string;
  timestamp: string;
};

export function normalizePriceUpdate(raw: unknown, index: number): NormalizedPriceUpdate {
  const record = asRecord(raw);
  const amountValue = record.amount ?? record.price ?? record.suggestedPrice;
  const amount = typeof amountValue === "number" ? amountValue : Number(amountValue);

  return {
    key: firstText(record, ["_id", "id"], String(index)),
    amount: Number.isFinite(amount) ? amount : null,
    status: firstText(record, ["status"], ""),
    note: firstText(record, ["reason", "note", "notes"], ""),
    actor: text(record.updatedBy ?? record.by, ""),
    timestamp: firstText(record, ["createdAt", "timestamp"], ""),
  };
}

export type NormalizedTimelineEvent = {
  key: string;
  label: string;
  description: string;
  reason: string;
  actor: string;
  previousState: string;
  newState: string;
  timestamp: string;
  timestampMs: number;
  source: "stage" | "timeline";
};


export function normalizeTimelineEvent(raw: unknown, source: "stage" | "timeline", index: number): NormalizedTimelineEvent {
  const record = asRecord(raw);
  const rawLabel = firstText(record, ["status", "stage", "event", "type", "title"], "Update");
  const timestamp = firstText(record, ["timestamp", "createdAt", "at", "date", "updatedAt"], "");
  const timestampMs = timestamp ? new Date(timestamp).getTime() : NaN;
  const actorSource = record.actor ?? record.by ?? record.performedBy ?? record.updatedBy;
  const actorRecord = asRecord(actorSource);
  const actor = firstText(actorRecord, ["name", "fullName"], text(actorSource, ""));

  return {
    key: `${source}-${index}-${firstText(record, ["_id", "id"], String(index))}`,
    label: rawLabel === "Update" ? rawLabel : formatStatusLabel(rawLabel, rawLabel),
    description: firstText(record, ["description", "message"], ""),
    reason: firstText(record, ["reason", "notes", "note"], ""),
    actor,
    previousState: firstText(record, ["previousState", "previousStatus", "from"], ""),
    newState: firstText(record, ["newState", "newStatus", "to"], ""),
    timestamp,
    timestampMs: Number.isFinite(timestampMs) ? timestampMs : 0,
    source,
  };
}

export function buildLifecycleTimeline(request: ServiceRequest): NormalizedTimelineEvent[] {
  const stages = (request.jobStages ?? []).map((entry, index) => normalizeTimelineEvent(entry, "stage", index));
  const events = (request.timeline ?? []).map((entry, index) => normalizeTimelineEvent(entry, "timeline", index));
  return [...stages, ...events].sort((a, b) => a.timestampMs - b.timestampMs);
}
