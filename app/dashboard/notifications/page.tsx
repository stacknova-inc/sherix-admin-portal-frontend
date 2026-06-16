"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { Bell, FileText, Loader2, Plus, Upload } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  ChannelIcons,
  FilterSelect,
  MetricGrid,
  SearchBox,
  SoftTag,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { asRecord, dateText, firstText, recordId, text, timeText } from "@/lib/live-data";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotification";
import type { AdminNotification } from "@/types";

type NotificationRow = {
  id: string;
  title: string;
  description: string;
  type: string;
  channels: string[];
  audience: string;
  sentTo: string;
  status: string;
  sentOn: string;
  time: string;
  tone: string;
};

const quickActions = [
  { label: "Create Notification", icon: Plus },
  { label: "Upload Recipients", icon: Upload },
  { label: "View Scheduled", icon: Bell },
  { label: "Notification Templates", icon: FileText },
];

function toneForType(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes("alert") || normalized.includes("security")) return "red";
  if (normalized.includes("payment")) return "green";
  if (normalized.includes("job")) return "blue";
  if (normalized.includes("template")) return "purple";
  return "amber";
}

function channelsFrom(record: Record<string, unknown>) {
  if (Array.isArray(record.channels)) return record.channels.map((channel) => text(channel, "")).filter(Boolean);
  const channel = text(record.channel, "");
  return channel ? [channel] : [];
}

function sentToFrom(record: Record<string, unknown>) {
  if (typeof record.sentTo === "number") return String(record.sentTo);
  if (typeof record.sentTo === "string") return record.sentTo;
  if (Array.isArray(record.recipients)) return String(record.recipients.length);
  const recipient = asRecord(record.recipient);
  return firstText(recipient, ["name", "email", "phoneNumber"], "0");
}

function mapNotification(notification: AdminNotification): NotificationRow {
  const record = notification as unknown as Record<string, unknown>;
  const type = firstText(record, ["type", "category"], "Notification");
  const sentAt = record.sentAt ?? record.createdAt ?? record.updatedAt;
  return {
    id: recordId(notification),
    title: firstText(record, ["title", "name", "subject"], "Untitled notification"),
    description: firstText(record, ["description", "message", "body"], ""),
    type,
    channels: channelsFrom(record),
    audience: firstText(record, ["audience", "targetAudience", "recipientType"], "All Users"),
    sentTo: sentToFrom(record),
    status: firstText(record, ["status"], "Sent"),
    sentOn: dateText(sentAt),
    time: timeText(sentAt),
    tone: toneForType(type),
  };
}

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
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState("All Types");
  const [channel, setChannel] = React.useState("All Channels");
  const [audience, setAudience] = React.useState("All Audience");
  const [status, setStatus] = React.useState("All Status");
  const notificationsQuery = useNotifications();
  const rows = React.useMemo(() => (notificationsQuery.data ?? []).map(mapNotification), [notificationsQuery.data]);
  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !search || [row.title, row.description, row.type, row.audience, row.status, ...row.channels].join(" ").toLowerCase().includes(search);
      const matchesType = type === "All Types" || row.type.toLowerCase().includes(type.toLowerCase());
      const matchesChannel = channel === "All Channels" || row.channels.some((item) => item.toLowerCase() === channel.toLowerCase());
      const matchesAudience = audience === "All Audience" || row.audience.toLowerCase().includes(audience.toLowerCase());
      const matchesStatus = status === "All Status" || row.status.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesType && matchesChannel && matchesAudience && matchesStatus;
    });
  }, [audience, channel, query, rows, status, type]);
  const metrics = React.useMemo(
    () => [
      { label: "Total Notifications", value: String(rows.length), change: "Loaded from backend", direction: "up", tone: "red", icon: Bell },
      { label: "Sent", value: String(rows.filter((row) => row.status.toLowerCase().includes("sent")).length), change: "Loaded from backend", direction: "up", tone: "green", icon: Bell },
      { label: "Scheduled", value: String(rows.filter((row) => row.status.toLowerCase().includes("scheduled")).length), change: "Loaded from backend", direction: "up", tone: "amber", icon: Bell },
      { label: "Drafts", value: String(rows.filter((row) => row.status.toLowerCase().includes("draft")).length), change: "Loaded from backend", direction: "down", tone: "slate", icon: FileText },
      { label: "Channels", value: String(new Set(rows.flatMap((row) => row.channels)).size), change: "Derived from backend", direction: "up", tone: "blue", icon: Upload },
    ],
    [rows],
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Notifications" subtitle="Create, manage and track all system notifications sent to users and providers." />
      <MetricGrid metrics={metrics} />

      <div className="font-bold">All Notifications</div>

      <section className="grid gap-4 ">
        <CardShell>
          <ToolbarCard>
            <SearchBox placeholder="Search by title, type, audience or template..." value={query} onChange={setQuery} />
            <FilterSelect placeholder="All Types" values={["All Types", "Job Update", "Payment", "Alert", "Security"]} value={type} onChange={setType} />
            <FilterSelect placeholder="All Channels" values={["All Channels", "Email", "SMS", "Push"]} value={channel} onChange={setChannel} />
            <FilterSelect placeholder="All Audience" values={["All Audience", "Customers", "Service Providers", "All Users"]} value={audience} onChange={setAudience} />
            <FilterSelect placeholder="All Status" values={["All Status", "Sent", "Scheduled", "Draft"]} value={status} onChange={setStatus} />
            <Button>
              <Plus className="h-4 w-4" />
              Create Notification
            </Button>
          </ToolbarCard>
          {notificationsQuery.isLoading ? (
            <div className="flex items-center gap-2 p-6 text-sm font-semibold text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : notificationsQuery.isError ? (
            <div className="p-6 text-sm font-semibold text-red-600">Unable to load notifications.</div>
          ) : (
            <AdminDataTable data={filteredRows} columns={notificationColumns} minWidth="1220px" rowLabel="notifications" />
          )}
        </CardShell>
      </section>
    </div>
  );
}
