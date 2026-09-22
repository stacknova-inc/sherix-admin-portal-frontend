import { canAccessPath, normalizeRole, StaffRole } from "@/lib/rbac";

const SENSITIVE_KEY_PATTERN =
  /password|secret|token|otp\b|pin\b|cvv|card[_-]?number|bank[_-]?account|account[_-]?number|routing[_-]?number|\bssn\b|\bnin\b|passport|api[_-]?key|private[_-]?key/i;

const RESTRICTED_KEY_PATTERN = /evidence|document|attachment|receipt|kyc/i;

export function isSensitiveAuditKey(key: string) {
  return SENSITIVE_KEY_PATTERN.test(key);
}

/**
 * Only these roles ever see restricted-but-not-credential audit fields (evidence,
 * documents, KYC attachments) unmasked. Both already hold Permission.AUDIT_LOGS, so this
 * is a further split within the set of roles that can reach the audit screens at all.
 */
export function canViewAuditSensitiveDetails(role: string | null | undefined) {
  const normalized = normalizeRole(role);
  return normalized === StaffRole.SUPER_ADMIN || normalized === StaffRole.COMPLIANCE_ADMIN;
}

/**
 * Recursively masks an arbitrary before/after/changes payload before it is ever rendered.
 * Credential-like fields (password, token, secret, card/bank numbers, ...) are masked for
 * every role - there is no legitimate reason for this UI to ever show one, so this is not
 * gated by canViewAuditSensitiveDetails. Broader restricted fields (evidence, documents,
 * KYC) are masked unless the viewer holds an elevated audit role.
 */
export function maskAuditPayload(value: unknown, canViewSensitive: boolean, depth = 0): unknown {
  if (depth > 5) return value;
  if (Array.isArray(value)) return value.map((item) => maskAuditPayload(item, canViewSensitive, depth + 1));
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(record)) {
      if (isSensitiveAuditKey(key)) {
        output[key] = "•••••• (hidden)";
        continue;
      }
      if (!canViewSensitive && RESTRICTED_KEY_PATTERN.test(key)) {
        output[key] = "Restricted — requires elevated permission";
        continue;
      }
      output[key] = maskAuditPayload(entryValue, canViewSensitive, depth + 1);
    }
    return output;
  }
  return value;
}

const ENTITY_ROUTE_BUILDERS: Record<string, (id: string) => string> = {
  user: () => "/dashboard/customers",
  customer: () => "/dashboard/customers",
  service_request: (id) => `/dashboard/requests/${id}`,
  servicerequest: (id) => `/dashboard/requests/${id}`,
  request: (id) => `/dashboard/requests/${id}`,
  dispute: (id) => `/dashboard/disputes/${id}`,
  ticket: (id) => `/dashboard/support-tickets/${id}`,
  support_ticket: (id) => `/dashboard/support-tickets/${id}`,
  staff: (id) => `/dashboard/staff-management/${id}`,
  admin: (id) => `/dashboard/staff-management/${id}`,
  administrator: (id) => `/dashboard/staff-management/${id}`,
  commission: () => "/dashboard/commissions",
  payout: () => "/dashboard/earnings-payments",
  earning: () => "/dashboard/earnings-payments",
  payment: () => "/dashboard/transactions",
  transaction: () => "/dashboard/transactions",
  review: () => "/dashboard/ratings-reviews",
  rating: () => "/dashboard/ratings-reviews",
  configuration: () => "/dashboard/operational-settings",
  policy_config: () => "/dashboard/operational-settings",
  content: () => "/dashboard/organization-data",
  campaign: () => "/dashboard/organization-data",
  ad_campaign: () => "/dashboard/organization-data",
  legal_document: () => "/dashboard/organization-data",
};

/**
 * Builds a safe navigation target for an audit entry's target entity. Returns undefined
 * (never a dead or fabricated link) when the entity type is unrecognized or the viewer's
 * role cannot access the destination - callers must render plain text in that case, not a
 * Link, so a context link always either navigates somewhere real or fails silently safe.
 */
export function safeAuditEntityHref(
  entityType: string | undefined,
  entityId: string | undefined,
  role: string | null | undefined,
): string | undefined {
  if (!entityType) return undefined;
  const builder = ENTITY_ROUTE_BUILDERS[entityType.toLowerCase().replace(/[\s-]+/g, "_")];
  if (!builder) return undefined;
  const href = builder(entityId ?? "");
  return canAccessPath(role, href) ? href : undefined;
}

/**
 * Renders a timestamp with an explicit timezone label (never bare "3:45 PM" with an
 * implicit, ambiguous zone) plus the full UTC ISO instant for the title/tooltip.
 */
export function formatAuditTimestamp(value: unknown): { display: string; iso: string } {
  if (!value) return { display: "Not available", iso: "" };
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return { display: String(value), iso: "" };
  const display = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
  return { display, iso: date.toISOString() };
}

export const AUDIT_ENTITY_TYPE_OPTIONS = [
  { label: "User", value: "user" },
  { label: "Service Request", value: "service_request" },
  { label: "Payment", value: "payment" },
  { label: "Commission", value: "commission" },
  { label: "Payout", value: "payout" },
  { label: "Dispute", value: "dispute" },
  { label: "Support Ticket", value: "ticket" },
  { label: "Review", value: "review" },
  { label: "Configuration", value: "configuration" },
  { label: "Content", value: "content" },
  { label: "Administrator", value: "admin" },
];

export const AUDIT_OUTCOME_OPTIONS = ["Success", "Failed", "Warning"];
