import type { ApiTimestamped } from "@/types";

export function recordId(record: ApiTimestamped) {
  return record._id ?? record.id ?? "";
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function idText(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  const record = asRecord(value);
  return text(record._id ?? record.id, "");
}

export function uniqueRecordIds(...values: unknown[]) {
  return Array.from(new Set(values.map(idText).filter(Boolean)));
}

export function text(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  const record = asRecord(value);
  return text(record.value ?? record.count ?? record.total ?? record.name ?? record.title ?? record.fullName ?? record.companyName, fallback);
}

export function firstText(record: Record<string, unknown>, keys: string[], fallback = "-") {
  for (const key of keys) {
    const value = record[key];
    if (value !== null && value !== undefined && value !== "") return text(value, fallback);
  }
  return fallback;
}

export function money(value: unknown, currency = "GHS") {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return text(value);
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function dateText(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function timeText(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "S").concat(parts[1]?.[0] ?? "").toUpperCase();
}

export type ProviderStatus = "Pending" | "Active" | "Suspended";

/**
 * Account lifecycle status for companies/mechanics, read only from the
 * backend's top-level `status` field. This is independent of KYC/verification
 * review outcome - see getKycStatus - and must never be inferred from it.
 */
export function getProviderStatus(provider: { status?: string }): ProviderStatus {
  const status = provider.status?.toLowerCase();

  if (status === "suspended" || status === "banned") return "Suspended";
  if (status === "active") return "Active";

  return "Pending";
}

export type KycStatus = "Pending" | "Approved" | "Rejected";

/** KYC/verification review status for companies/mechanics, read from `kyc.status`. */
export function getKycStatus(provider: { kyc?: { status?: string } }): KycStatus {
  const status = provider.kyc?.status?.toLowerCase();

  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";

  return "Pending";
}

export function activeStatus(record: Record<string, unknown>, fallback = "Active") {
  if (typeof record.status === "string") return record.status.toLowerCase() === "banned" ? "Suspended" : record.status;
  if (typeof record.verificationStatus === "string") return record.verificationStatus;
  if (typeof record.isActive === "boolean") return record.isActive ? "Active" : "Suspended";
  return fallback;
}

export function metricValue(stats: Record<string, unknown> | undefined, keys: string[], fallback = "0") {
  if (!stats) return fallback;
  return firstText(stats, keys, fallback);
}

export function metricChange(stats: Record<string, unknown> | undefined, keys: string[], fallback = "Live backend data") {
  if (!stats) return fallback;

  for (const key of keys) {
    const metric = asRecord(stats[key]);
    const change = metric.change ?? metric.percentageChange ?? metric.delta;
    if (change === null || change === undefined || change === "") continue;

    const numericChange = Number(change);
    if (Number.isFinite(numericChange)) {
      const sign = numericChange > 0 ? "+" : "";
      return `${sign}${numericChange}%`;
    }

    return text(change, fallback);
  }

  return fallback;
}

export function metricDirection(stats: Record<string, unknown> | undefined, keys: string[], fallback: "up" | "down" = "up") {
  if (!stats) return fallback;

  for (const key of keys) {
    const metric = asRecord(stats[key]);
    const change = Number(metric.change ?? metric.percentageChange ?? metric.delta);
    if (Number.isFinite(change)) return change < 0 ? "down" : "up";
  }

  return fallback;
}
