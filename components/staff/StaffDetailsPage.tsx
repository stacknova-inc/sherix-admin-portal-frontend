"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock3, KeyRound, UserRound } from "lucide-react";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SoftTag, StatusCell } from "@/components/shared/AdminPrimitives";
import { Button } from "@/components/ui/button";
import { useStaffAuditLogs, useStaffMember, useStaffNotifications } from "@/hooks/useStaff";
import { staffRoleDefinitions } from "@/services/staff";

function dateTime(value?: string) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function roleLabel(role?: string) {
  return staffRoleDefinitions.find((definition) => definition.role === role)?.label ?? role ?? "Unassigned";
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-[11px] font-bold uppercase text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-black">{value}</div>
    </div>
  );
}

export function StaffDetailsPage() {
  const params = useParams<{ staffId: string }>();
  const staffId = params.staffId;
  const staffQuery = useStaffMember(staffId);
  const auditQuery = useStaffAuditLogs(staffId);
  const notificationsQuery = useStaffNotifications(staffId);
  const staff = staffQuery.data;

  if (staffQuery.isLoading) {
    return <div className="p-6 text-sm font-semibold text-muted-foreground">Loading staff profile...</div>;
  }

  if (!staff) {
    return (
      <div className="mx-auto max-w-[900px] space-y-4">
        <Button asChild variant="outline">
          <Link href="/dashboard/staff-management">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <CardShell className="p-6 text-sm font-semibold text-red-600">Staff member was not found.</CardShell>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button asChild variant="outline" className="h-9">
            <Link href="/dashboard/staff-management">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <PageHeader title={staff.fullName} subtitle="Staff profile, activity timestamps, notifications, and administrative audit history." />
        </div>
        <StatusCell status={staff.status} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <CardShell className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black">Personal Information</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Name" value={staff.fullName} />
            <InfoRow label="Email" value={staff.email} />
            <InfoRow label="Phone Number" value={staff.phoneNumber} />
            <InfoRow label="Department" value={<SoftTag tone="blue">{staff.department}</SoftTag>} />
            <InfoRow label="Role" value={roleLabel(staff.role)} />
            <InfoRow label="Status" value={<StatusCell status={staff.status} />} />
          </div>
        </CardShell>

        <CardShell className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black">Activity Information</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoRow label="Account Created" value={dateTime(staff.createdAt)} />
            <InfoRow label="Last Login" value={dateTime(staff.lastLogin)} />
            <InfoRow label="Last Activity" value={dateTime(staff.lastActivityAt)} />
          </div>
        </CardShell>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CardShell className="p-4">
          <h2 className="text-sm font-black">Audit Logging</h2>
          <div className="mt-3 grid gap-2">
            {(auditQuery.data ?? []).map((event) => (
              <div key={event.id} className="rounded-xl border bg-card p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black">{event.actionType}</p>
                  <span className="text-muted-foreground">{dateTime(event.timestamp)}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{event.note}</p>
                <p className="mt-2 font-semibold">Performed by {event.performedBy}</p>
              </div>
            ))}
            {!auditQuery.data?.length && <p className="rounded-xl border p-4 text-sm font-semibold text-muted-foreground">No staff-specific audit events yet.</p>}
          </div>
        </CardShell>
        <CardShell className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black">Notifications</h2>
          </div>
          <div className="grid gap-2">
            {(notificationsQuery.data ?? []).map((notification) => (
              <div key={notification.id} className="rounded-xl border bg-card p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black">{notification.type}</p>
                  <span className="text-muted-foreground">{dateTime(notification.timestamp)}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{notification.message}</p>
                <p className="mt-2 font-semibold">Sent to {notification.sentTo}</p>
              </div>
            ))}
            {!notificationsQuery.data?.length && <p className="rounded-xl border p-4 text-sm font-semibold text-muted-foreground">No notifications recorded for this staff member.</p>}
          </div>
        </CardShell>
      </div>
    </div>
  );
}
