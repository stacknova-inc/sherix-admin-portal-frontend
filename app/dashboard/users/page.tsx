"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
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
import { userManagementMetrics, usersManagement } from "@/lib/mock-data";

type UserRow = (typeof usersManagement)[number];

const userColumns: ColumnDef<UserRow>[] = [
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
  { id: "actions", header: "Actions", cell: () => <ActionMenu /> },
];

export default function UsersPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Users Management" subtitle="Manage and monitor all platform users." />
      </div>

      <MetricGrid metrics={userManagementMetrics} />

      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search users by name, email or phone..." />
          <FilterSelect placeholder="All Status" values={["All Status", "Active", "Inactive", "Pending", "Suspended"]} />
          <div className="flex gap-3">
           
            <ExportButton />
          </div>
        </ToolbarCard>
        <AdminDataTable data={usersManagement} columns={userColumns} minWidth="1120px" />
        <PaginationFooter label="Showing 1 to 10 of 12,458 users" pageCount="1246" />
      </CardShell>
    </div>
  );
}
