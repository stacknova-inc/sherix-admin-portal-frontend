"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  ExportButton,
  FilterSelect,
  MetricGrid,
  PaginationFooter,
  PersonCell,
  SearchBox,
  SoftTag,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api";
import { activeStatus, dateText, firstText, initials, metricValue, recordId } from "@/lib/live-data";
import { useUserAction, useUsers, useUserStats } from "@/hooks/useUsers";
import type { User } from "@/types";
import { Clock3, UserCheck, UserPlus, UserRoundX, Users } from "lucide-react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  joinedDate: string;
  status: string;
  initials: string;
  avatarTone: string;
};

function mapUser(user: User): UserRow {
  const record = user as unknown as Record<string, unknown>;
  const name = firstText(record, ["name", "fullName"], `${firstText(record, ["firstName"], "")} ${firstText(record, ["lastName"], "")}`.trim() || "Unnamed user");
  return {
    id: recordId(user),
    name,
    email: firstText(record, ["email"]),
    phone: firstText(record, ["phone", "phoneNumber"]),
    type: firstText(record, ["type", "userType", "role"], "Customer"),
    joinedDate: dateText(user.createdAt),
    status: activeStatus(record),
    initials: initials(name),
    avatarTone: "bg-slate-900 text-white",
  };
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return <div className="fixed bottom-5 right-5 z-50 rounded-xl border bg-card p-4 text-sm font-bold shadow-2xl">{message}</div>;
}

function UserActions({ user, onToast }: { user: UserRow; onToast: (message: string) => void }) {
  const action = useUserAction();
  const isSuspended = user.status.toLowerCase().includes("suspend") || user.status.toLowerCase().includes("inactive");
  const nextAction = isSuspended ? "activate" : "suspend";

  async function runAction() {
    try {
      const reason = nextAction === "suspend" ? window.prompt("Reason for suspension") ?? undefined : undefined;
      await action.mutateAsync({ id: user.id, action: nextAction, reason });
      onToast(`User ${nextAction === "activate" ? "activated" : "suspended"} successfully.`);
    } catch (error) {
      onToast(getErrorMessage(error, `Unable to ${nextAction} user`));
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/dashboard/users/${user.id}`}>View</Link>
      </Button>
      <Button variant="outline" size="sm" onClick={runAction} disabled={action.isPending}>
        {action.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {isSuspended ? "Activate" : "Suspend"}
      </Button>
    </div>
  );
}

const userColumns = (onToast: (message: string) => void): ColumnDef<UserRow>[] => [
  { accessorKey: "id", header: "User ID", cell: ({ row }) => <span className="font-semibold">{row.original.id}</span> },
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => <PersonCell name={row.original.name} initials={row.original.initials} avatarTone={row.original.avatarTone} />,
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
  {
    accessorKey: "type",
    header: "User Type",
    cell: ({ row }) => <SoftTag tone={row.original.type === "Service Provider" ? "purple" : "blue"}>{row.original.type}</SoftTag>,
  },
  { accessorKey: "joinedDate", header: "Joined Date" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { id: "actions", header: "Actions", cell: ({ row }) => <UserActions user={row.original} onToast={onToast} /> },
];

export default function UsersPage() {
  const [toast, setToast] = React.useState("");
  const usersQuery = useUsers();
  const statsQuery = useUserStats();
  const rows = React.useMemo(() => (usersQuery.data ?? []).map(mapUser), [usersQuery.data]);
  const metrics = React.useMemo(
    () => [
      { label: "Total Users", value: metricValue(statsQuery.data, ["totalUsers", "total", "users"]), change: "Live backend data", direction: "up", tone: "red", icon: Users },
      { label: "Active Users", value: metricValue(statsQuery.data, ["activeUsers", "active"]), change: "Live backend data", direction: "up", tone: "green", icon: UserCheck },
      { label: "New Users", value: metricValue(statsQuery.data, ["newUsers", "newThisWeek", "new"]), change: "Live backend data", direction: "up", tone: "blue", icon: UserPlus },
      { label: "Inactive Users", value: metricValue(statsQuery.data, ["inactiveUsers", "inactive"]), change: "Live backend data", direction: "down", tone: "amber", icon: Clock3 },
      { label: "Suspended Users", value: metricValue(statsQuery.data, ["suspendedUsers", "suspended"]), change: "Live backend data", direction: "down", tone: "purple", icon: UserRoundX },
    ],
    [statsQuery.data],
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Users Management" subtitle="Manage and monitor all platform users." />
      </div>

      <MetricGrid metrics={metrics} />

      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search users by name, email or phone..." />
          <FilterSelect placeholder="All Status" values={["All Status", "Active", "Inactive", "Pending", "Suspended"]} />
          <div className="flex gap-3">
           
            <ExportButton />
          </div>
        </ToolbarCard>
        {usersQuery.isLoading ? (
          <div className="p-6 text-sm font-semibold text-muted-foreground">Loading users...</div>
        ) : usersQuery.isError ? (
          <div className="p-6 text-sm font-semibold text-red-600">Unable to load users.</div>
        ) : (
          <AdminDataTable data={rows} columns={userColumns(setToast)} minWidth="1120px" />
        )}
        <PaginationFooter label={`Showing ${rows.length ? `1 to ${rows.length}` : "0"} of ${rows.length} users`} pageCount={String(Math.max(1, Math.ceil(rows.length / 10)))} />
      </CardShell>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
