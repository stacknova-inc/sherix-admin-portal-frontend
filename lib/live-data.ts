import type { ApiTimestamped } from "@/types";

export function recordId(record: ApiTimestamped) {
  return record._id ?? record.id ?? "";
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function text(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  const record = asRecord(value);
  return text(record.name ?? record.title ?? record.fullName ?? record.companyName, fallback);
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

export function activeStatus(record: Record<string, unknown>, fallback = "Active") {
  if (typeof record.status === "string") return record.status;
  if (typeof record.verificationStatus === "string") return record.verificationStatus;
  if (typeof record.isActive === "boolean") return record.isActive ? "Active" : "Suspended";
  return fallback;
}

export function metricValue(stats: Record<string, unknown> | undefined, keys: string[], fallback = "0") {
  if (!stats) return fallback;
  return firstText(stats, keys, fallback);
}
