"use client";

import Link from "next/link";
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuditLogs } from "@/hooks/useAudit";
import { formatAuditTimestamp, safeAuditEntityHref } from "@/lib/audit";
import { asRecord, firstText } from "@/lib/live-data";
import { hasPermission, Permission } from "@/lib/rbac";
import { useUiStore } from "@/store/use-ui-store";
import type { AuditLog } from "@/services/audit";

function actorLabel(record: Record<string, unknown>) {
  const actor = asRecord(record.actor ?? record.user ?? record.admin ?? record.performedBy);
  return firstText(actor, ["fullName", "name", "email"], firstText(record, ["actorName", "adminName", "performedByName"], "System"));
}

/**
 * Read-only, contextual slice of the shared audit log scoped to one entity (or one actor).
 * Used to embed "what happened to/on this record" panels inside entity detail views without
 * duplicating the masking/link-safety logic that lives in lib/audit.ts and the main
 * /dashboard/audit-logs screen.
 */
export function AuditTrailPanel({
  entityType,
  entityId,
  actor,
  title = "Audit trail",
  limit = 5,
}: {
  entityType?: string;
  entityId?: string;
  actor?: string;
  title?: string;
  limit?: number;
}) {
  const role = useUiStore((state) => state.role ?? state.user?.role);
  const allowed = hasPermission(role, Permission.AUDIT_LOGS);
  const query = useAuditLogs({ entityType, entityId, actor, limit }, { enabled: allowed });
  const entries = query.data?.data ?? [];

  const params = new URLSearchParams();
  if (entityType) params.set("entityType", entityType);
  if (entityId) params.set("entityId", entityId);
  if (actor) params.set("actor", actor);
  const fullHistoryHref = `/dashboard/audit-logs${params.toString() ? `?${params.toString()}` : ""}`;

  if (!allowed) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{title}</p>
        <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Your role does not have the Audit Logs permission required to view this trail.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{title}</p>
        <Link href={fullHistoryHref} className="text-xs font-bold text-primary hover:underline">
          View full audit history
        </Link>
      </div>
      {query.isLoading ? (
        <div role="status" aria-live="polite" className="flex items-center gap-2 rounded-xl border bg-card p-4 text-sm font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading audit trail...
        </div>
      ) : query.isError ? (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertTriangle className="h-4 w-4" />
          Unable to load the audit trail.
        </div>
      ) : !entries.length ? (
        <EmptyState title="No audit activity yet" description="Actions taken on this record will appear here." />
      ) : (
        <div className="space-y-2">
          {entries.slice(0, limit).map((entry: AuditLog, index: number) => {
            const record = entry as unknown as Record<string, unknown>;
            const timestamp = formatAuditTimestamp(record.timestamp ?? record.createdAt ?? record.time);
            const href = safeAuditEntityHref(
              firstText(record, ["entityType", "resourceType", "targetType"], ""),
              firstText(record, ["entityId", "resourceId", "targetId"], ""),
              role,
            );
            const outcome = firstText(record, ["result", "outcome"], "");
            const reason = firstText(record, ["reason", "note"], "");
            return (
              <div key={firstText(record, ["id", "_id"], String(index))} className="rounded-xl border bg-card p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b>{firstText(record, ["action", "actionType", "event"], "Activity")}</b>
                  <span className="text-xs text-muted-foreground" title={timestamp.iso || undefined}>
                    {timestamp.display}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  By {actorLabel(record)}
                  {outcome && outcome !== "-" ? ` · ${outcome}` : ""}
                </p>
                {reason && reason !== "-" && <p className="mt-1 text-xs text-muted-foreground">Reason: {reason}</p>}
                {href && (
                  <Link href={href} className="mt-1 inline-block text-xs font-bold text-primary hover:underline">
                    View related record
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
