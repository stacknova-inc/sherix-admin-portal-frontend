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

        
      </div>

      
    </div>
  );
}
