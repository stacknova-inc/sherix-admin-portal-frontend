"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { useState } from "react";
import {
  Eye,
  Loader2,
  MoreVertical,
  UserCheck,
  UserRoundX,
  Users,
} from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ExportButton,
  FilterSelect,
  MetricGrid,
  PersonCell,
  SearchBox,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { AccountStateDialog } from "@/components/shared/AccountStateDialog";
import { DetailGrid } from "@/components/shared/DetailField";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/api";
import { hasPermission, Permission } from "@/lib/rbac";
import { useUiStore } from "@/store/use-ui-store";
import { activeStatus, asRecord, dateText, firstText, initials, recordId } from "@/lib/live-data";
import { useUser, useUserAction, useUsers } from "@/hooks/useUsers";
import type { User } from "@/types";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  initials: string;
  avatarTone: string;
};

function mapUser(user: User): UserRow {
  const record = user as unknown as Record<string, unknown>;
  const name = firstText(
    record,
    ["name", "fullName"],
    `${firstText(record, ["firstName"], "")} ${firstText(record, ["lastName"], "")}`.trim() ||
      "Unnamed customer",
  );
  return {
    id: recordId(user),
    name,
    email: firstText(record, ["email"]),
    phone: firstText(record, ["phone", "phoneNumber"]),
    status: activeStatus(record),
    createdAt: firstText(record, ["createdAt"], ""),
    initials: initials(name),
    avatarTone: "bg-slate-900 text-white",
  };
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 rounded-xl border bg-card p-4 text-sm font-bold shadow-2xl">
      {message}
    </div>
  );
}

function CustomerDetailsDialog({ id, onOpenChange }: { id: string; onOpenChange: (open: boolean) => void }) {
  const userQuery = useUser(id);
  const user = userQuery.data;
  const record = asRecord(user);
  const name = firstText(
    record,
    ["name", "fullName"],
    `${firstText(record, ["firstName"], "")} ${firstText(record, ["lastName"], "")}`.trim() || "Customer details",
  );

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Customer profile and account details from the backend.</DialogDescription>
        </DialogHeader>
        {userQuery.isLoading ? (
          <p className="text-sm font-semibold text-muted-foreground">Loading customer details...</p>
        ) : userQuery.isError || !user ? (
          <p className="text-sm font-semibold text-red-600">Unable to load customer details.</p>
        ) : (
          <div className="space-y-4">
            <DetailGrid
              fields={[
                ["Email", firstText(record, ["email"])],
                ["Phone", firstText(record, ["phone", "phoneNumber"])],
                ["Customer Type", firstText(record, ["type", "userType", "role"], "Customer")],
                ["Joined", dateText(user.createdAt)],
                ["KYC Status", firstText(record, ["kycStatus", "verificationStatus"], "Not available")],
                ["Email Verification", typeof record.emailVerified === "boolean" ? (record.emailVerified ? "Verified" : "Not verified") : "Not available"],
                ["Address", firstText(record, ["address", "location"], "Not available")],
                ["Date of birth", firstText(record, ["dateOfBirth", "dob"], "Not available")],
              ]}
            />
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground">Status</p>
              <div className="mt-2">
                <StatusCell status={activeStatus(record)} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function UserActions({
  user,
  onToast,
  onView,
}: {
  user: UserRow;
  onToast: (message: string) => void;
  onView: (id: string) => void;
}) {
  const action = useUserAction();
  const role = useUiStore((state) => state.role ?? state.user?.role);
  const canManage = hasPermission(role, Permission.USERS);
  const [pendingAction, setPendingAction] = useState<"activate" | "suspend" | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  const isSuspended =
    user.status.toLowerCase().includes("suspend") ||
    user.status.toLowerCase().includes("inactive");

  async function runAction(nextAction: "activate" | "suspend") {
    if (!canManage) return;
    setPendingAction(nextAction);
  }
  async function confirmAction() {
    if (!pendingAction) return;
    try {
      await action.mutateAsync({
        id: user.id,
        action: pendingAction,
        reason: pendingAction === "suspend" ? suspensionReason : undefined,
      });
      onToast(`Customer ${pendingAction === "activate" ? "activated" : "suspended"} successfully. An email notification will be sent to the customer.`);
      setPendingAction(null); setSuspensionReason("");
    } catch (error) {
      onToast(getErrorMessage(error, `Unable to ${pendingAction} customer`));
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${user.name}`}
            disabled={action.isPending}
          >
            {action.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem onSelect={() => setTimeout(() => onView(user.id), 0)}>
            <Eye className="h-4 w-4" />
            View Customer
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setTimeout(() => runAction("activate"), 0)}
            disabled={!isSuspended || action.isPending || !canManage}
          >
            <UserCheck className="h-4 w-4" />
            Activate Customer
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setTimeout(() => runAction("suspend"), 0)}
            disabled={isSuspended || action.isPending || !canManage}
            className="text-red-600"
          >
            <UserRoundX className="h-4 w-4" />
            Suspend Customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {pendingAction && <AccountStateDialog open accountLabel="Customer" action={pendingAction} reason={suspensionReason} onReasonChange={setSuspensionReason} pending={action.isPending} onOpenChange={(open) => !open && setPendingAction(null)} onConfirm={() => void confirmAction()} />}
    </>
  );
}

const userColumns = (
  onToast: (message: string) => void,
  onView: (id: string) => void,
): ColumnDef<UserRow>[] => [
  {
    accessorKey: "id",
    header: "Customer ID",
    cell: ({ row }) => <span className="font-semibold">{row.original.id}</span>,
  },
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <PersonCell
        name={row.original.name}
        initials={row.original.initials}
        avatarTone={row.original.avatarTone}
      />
    ),
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <UserActions user={row.original} onToast={onToast} onView={onView} />,
  },
];

export default function CustomersPage() {
  const [toast, setToast] = React.useState("");
  const [viewingId, setViewingId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All Status");
  const usersQuery = useUsers();
  const rows = React.useMemo(
    () => (usersQuery.data ?? []).map(mapUser),
    [usersQuery.data],
  );
  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !search ||
        [row.name, row.email, row.phone, row.status]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesStatus =
        status === "All Status" ||
        row.status.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [query, rows, status]);
  const derivedStats = React.useMemo(() => {
    const users = usersQuery.data ?? [];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      active: rows.filter((row) => row.status.toLowerCase().includes("active"))
        .length,
      inactive: rows.filter((row) =>
        row.status.toLowerCase().includes("inactive"),
      ).length,
      suspended: rows.filter((row) =>
        row.status.toLowerCase().includes("suspend"),
      ).length,
      newUsers: users.filter((user) => {
        const created = user.createdAt ? new Date(user.createdAt) : null;
        return (
          created && Number.isFinite(created.getTime()) && created >= weekAgo
        );
      }).length,
    };
  }, [rows, usersQuery.data]);
  const metrics = React.useMemo(
    () => [
      {
        label: "Total Customers",
        value: String(rows.length),
        change: "Derived from loaded customers",
        direction: "up",
        tone: "red",
        icon: Users,
      },
      {
        label: "Active Customers",
        value: String(derivedStats.active),
        change: "Derived from loaded customers",
        direction: "up",
        tone: "green",
        icon: UserCheck,
      },
      {
        label: "Suspended Customers",
        value: String(derivedStats.suspended),
        change: "Derived from loaded customers",
        direction: "down",
        tone: "purple",
        icon: UserRoundX,
      },
    ],
    [derivedStats, rows.length],
  );

  const exportData = React.useMemo(
    () =>
      filteredRows.map(({ id, name, email, phone, status }) => ({
        id,
        name,
        email,
        phone,
        status,
      })),
    [filteredRows],
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Customers"
          subtitle="Manage and monitor all platform customers."
        />
      </div>

      <MetricGrid metrics={metrics} />

      <CardShell>
        <ToolbarCard>
          <SearchBox
            placeholder="Search customers by name, email or phone..."
            value={query}
            onChange={setQuery}
          />
          <FilterSelect
            placeholder="All Status"
            values={["All Status", "Active", "Inactive", "Suspended"]}
            value={status}
            onChange={setStatus}
          />
          <div className="flex gap-3">
            <ExportButton data={exportData} filename="customers" />
          </div>
        </ToolbarCard>
        {usersQuery.isLoading ? (
          <div className="p-6 text-sm font-semibold text-muted-foreground">
            Loading customers...
          </div>
        ) : usersQuery.isError ? (<div className="flex items-center gap-3 p-6 text-sm font-semibold text-red-600">Unable to load customers.<Button size="sm" variant="outline" onClick={() => void usersQuery.refetch()}>Retry</Button></div>
        ) : filteredRows.length === 0 ? (<div className="p-6 text-sm font-semibold text-muted-foreground">{query || status !== "All Status" ? "No customers match the current filters." : "No customers found."}</div>
        ) : (
          <AdminDataTable
            data={filteredRows}
            columns={userColumns(setToast, setViewingId)}
            minWidth="1120px"
            rowLabel="customers"
          />
        )}
      </CardShell>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      {viewingId && (
        <CustomerDetailsDialog id={viewingId} onOpenChange={(open) => !open && setViewingId(null)} />
      )}
    </div>
  );
}
