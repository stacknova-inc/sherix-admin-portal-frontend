"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import Link from "next/link";
import { Eye, Loader2, MoreVertical, UserCheck, UserRoundX } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ExportButton,
  FilterSelect,
  MetricGrid,
  PersonCell,
  SearchBox,
  SoftTag,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/api";
import { activeStatus, firstText, initials, recordId } from "@/lib/live-data";
import { useUserAction, useUsers } from "@/hooks/useUsers";
import type { User } from "@/types";
import { Clock3, UserPlus, Users } from "lucide-react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
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

  async function runAction(nextAction: "activate" | "suspend") {
    try {
      const reason = nextAction === "suspend" ? window.prompt("Reason for suspension") ?? undefined : undefined;
      await action.mutateAsync({ id: user.id, action: nextAction, reason });
      onToast(`User ${nextAction === "activate" ? "activated" : "suspended"} successfully.`);
    } catch (error) {
      onToast(getErrorMessage(error, `Unable to ${nextAction} user`));
    }
  }
  

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${user.name}`} disabled={action.isPending}>
          {action.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/users/${user.id}`}>
            <Eye className="h-4 w-4" />
            View User
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => runAction("activate")} disabled={!isSuspended || action.isPending}>
          <UserCheck className="h-4 w-4" />
          Activate User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => runAction("suspend")} disabled={isSuspended || action.isPending} className="text-red-600">
          <UserRoundX className="h-4 w-4" />
          Suspend User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { id: "actions", header: "Actions", cell: ({ row }) => <UserActions user={row.original} onToast={onToast} /> },
];

export default function UsersPage() {
  const [toast, setToast] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All Status");
  const usersQuery = useUsers();
  const rows = React.useMemo(() => (usersQuery.data ?? []).map(mapUser), [usersQuery.data]);
  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !search || [row.name, row.email, row.phone, row.status].join(" ").toLowerCase().includes(search);
      const matchesStatus = status === "All Status" || row.status.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [query, rows, status]);
  const derivedStats = React.useMemo(() => {
    const users = usersQuery.data ?? [];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      active: rows.filter((row) => row.status.toLowerCase().includes("active")).length,
      inactive: rows.filter((row) => row.status.toLowerCase().includes("inactive")).length,
      suspended: rows.filter((row) => row.status.toLowerCase().includes("suspend")).length,
      newUsers: users.filter((user) => {
        const created = user.createdAt ? new Date(user.createdAt) : null;
        return created && Number.isFinite(created.getTime()) && created >= weekAgo;
      }).length,
    };
  }, [rows, usersQuery.data]);
  const metrics = React.useMemo(
    () => [
      { label: "Total Users", value: String(rows.length), change: "Derived from loaded users", direction: "up", tone: "red", icon: Users },
      { label: "Active Users", value: String(derivedStats.active), change: "Derived from loaded users", direction: "up", tone: "green", icon: UserCheck },
      { label: "Suspended Users", value: String(derivedStats.suspended), change: "Derived from loaded users", direction: "down", tone: "purple", icon: UserRoundX },
    ],
    [derivedStats, rows.length],
  );

  const exportData = React.useMemo(
  () => filteredRows.map(({ id, name, email, phone,status }) => ({ id, name, email, phone,status })),
  [filteredRows],
);


  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Users Management" subtitle="Manage and monitor all platform users." />
      </div>

      <MetricGrid metrics={metrics} />

      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search users by name, email or phone..." value={query} onChange={setQuery} />
          <FilterSelect placeholder="All Status" values={["All Status", "Active", "Inactive", "Suspended"]} value={status} onChange={setStatus} />
          <div className="flex gap-3">
           
            <ExportButton data={exportData} filename="users" />
          </div>
        </ToolbarCard>
        {usersQuery.isLoading ? (
          <div className="p-6 text-sm font-semibold text-muted-foreground">Loading users...</div>
        ) : usersQuery.isError ? (
          <div className="p-6 text-sm font-semibold text-red-600">Unable to load users.</div>
        ) : (
          <AdminDataTable data={filteredRows} columns={userColumns(setToast)} minWidth="1120px" rowLabel="users" />
        )}
      </CardShell>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
