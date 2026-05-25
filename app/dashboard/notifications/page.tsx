"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Bell, FileText, Plus, Upload } from "lucide-react";
import { DonutChart } from "@/components/shared/AdminCharts";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  ChannelIcons,
  FilterButton,
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
  {
    accessorKey: "performance",
    header: "Performance",
    cell: ({ row }) => (
      <div className="min-w-[170px] space-y-1">
        {row.original.performance.map((item, index) => (
          <p key={`${row.original.title}-${index}`} className="text-xs font-semibold">
            {item}
          </p>
        ))}
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

      <div className="sherix-scrollbar flex gap-8 overflow-x-auto border-b">
        {["All Notifications", "Templates", "Scheduled", "History", "Subscribers"].map((tab, index) => (
          <button
            key={tab}
            className={cn("whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-black", index === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground")}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <CardShell>
          <ToolbarCard>
            <SearchBox placeholder="Search by title, type, audience or template..." />
            <FilterSelect placeholder="All Types" values={["All Types", "Job Update", "Payment", "Alert", "Security"]} />
            <FilterSelect placeholder="All Channels" values={["All Channels", "Email", "SMS", "Push"]} />
            <FilterSelect placeholder="All Audience" values={["All Audience", "Customers", "Service Providers", "All Users"]} />
            <FilterSelect placeholder="All Status" values={["All Status", "Sent", "Scheduled", "Draft"]} />
            <FilterButton />
            <Button>
              <Plus className="h-4 w-4" />
              Create Notification
            </Button>
          </ToolbarCard>
          <AdminDataTable data={notificationRows} columns={notificationColumns} minWidth="1220px" />
          <PaginationFooter label="Showing 1 to 8 of 42 notifications" pageCount="6" pageSize />
        </CardShell>

        <aside className="space-y-5">
          <CardShell className="p-4">
            <h2 className="text-base font-black">Quick Actions</h2>
            <div className="mt-4 space-y-1">
              {quickActions.map(({ label, icon: Icon }) => (
                <Button key={label} variant="ghost" className="w-full justify-start text-primary">
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </CardShell>

          <CardShell className="p-4">
            <SectionHeader title="Notification Summary" action="This Week" />
            <div className="grid gap-4 sm:grid-cols-[160px_1fr] xl:grid-cols-1">
              <DonutChart data={notificationSummary} total="24,785" label="Total Sent" height={180} />
              <div className="space-y-3">
                {notificationSummary.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-bold">
                      {item.value.toLocaleString()} ({item.percent})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardShell>

          <CardShell className="p-4">
            <SectionHeader title="Top Performing Notifications" />
            <div className="space-y-4">
              {topNotifications.map((item, index) => (
                <div key={item.name} className="grid grid-cols-[20px_1fr_64px] items-center gap-3 text-sm">
                  <span className="font-black">{index + 1}</span>
                  <span className="font-bold">{item.name}</span>
                  <span className="text-right font-black text-green-600">{item.rate}</span>
                </div>
              ))}
            </div>
          </CardShell>
        </aside>
      </section>
    </div>
  );
}
