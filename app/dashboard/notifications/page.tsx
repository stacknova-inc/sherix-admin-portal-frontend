"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Bell, FileText, Plus, Upload } from "lucide-react";
import { DonutChart } from "@/components/shared/AdminCharts";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  ChannelIcons,
  FilterSelect,
  MetricGrid,
  PaginationFooter,
  SearchBox,
  SectionHeader,
  SoftTag,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { notificationRows, notificationSummary, notificationsMetrics, topNotifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type NotificationRow = (typeof notificationRows)[number];

const quickActions = [
  { label: "Create Notification", icon: Plus },
  { label: "Upload Recipients", icon: Upload },
  { label: "View Scheduled", icon: Bell },
  { label: "Notification Templates", icon: FileText },
];

const notificationColumns: ColumnDef<NotificationRow>[] = [
  {
    accessorKey: "title",
    header: "Notification Title",
    cell: ({ row }) => (
      <div className="flex min-w-[260px] items-center gap-3">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", row.original.tone === "red" ? "bg-red-100 text-red-600" : row.original.tone === "amber" ? "bg-amber-100 text-amber-600" : row.original.tone === "blue" ? "bg-blue-100 text-blue-600" : row.original.tone === "purple" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700")}>
          <Bell className="h-5 w-5" />
        </span>
        <div>
          <p className="font-black">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.description}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "type", header: "Type", cell: ({ row }) => <SoftTag tone={row.original.tone}>{row.original.type}</SoftTag> },
  { accessorKey: "channels", header: "Channel", cell: ({ row }) => <ChannelIcons channels={row.original.channels} /> },
  { accessorKey: "audience", header: "Audience" },
  { accessorKey: "sentTo", header: "Sent To", cell: ({ row }) => <span className="font-black">{row.original.sentTo}</span> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  {
    accessorKey: "sentOn",
    header: "Sent On",
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <p className="font-semibold">{row.original.sentOn}</p>
        <p className="text-xs text-muted-foreground">{row.original.time}</p>
      </div>
    ),
  },
 
  { id: "actions", header: "Actions", cell: () => <ActionMenu /> },
];

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Notifications" subtitle="Create, manage and track all system notifications sent to users and providers." />
      <MetricGrid metrics={notificationsMetrics} />

      <div className="font-bold">
        All Notifications
      </div>

      <section className="grid gap-4 ">
        <CardShell>
          <ToolbarCard>
            <SearchBox placeholder="Search by title, type, audience or template..." />
            <FilterSelect placeholder="All Types" values={["All Types", "Job Update", "Payment", "Alert", "Security"]} />
            <FilterSelect placeholder="All Channels" values={["All Channels", "Email", "SMS", "Push"]} />
            <FilterSelect placeholder="All Audience" values={["All Audience", "Customers", "Service Providers", "All Users"]} />
            <FilterSelect placeholder="All Status" values={["All Status", "Sent", "Scheduled", "Draft"]} />
            <Button>
              <Plus className="h-4 w-4" />
              Create Notification
            </Button>
          </ToolbarCard>
          <AdminDataTable data={notificationRows} columns={notificationColumns} minWidth="1220px" />
          <PaginationFooter label="Showing 1 to 8 of 42 notifications" pageCount="6" pageSize />
        </CardShell>

        
        
      </section>
    </div>
  );
}
