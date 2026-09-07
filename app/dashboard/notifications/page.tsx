"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { Bell, FileText, Loader2, Plus, Send, Upload, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMutationOutcomeMessage } from "@/lib/api";
import { dateText, firstText, recordId, text, timeText } from "@/lib/live-data";
import { cn } from "@/lib/utils";
import { useBroadcastNotification, useNotifications } from "@/hooks/useNotification";
import { useIdempotencyKey } from "@/hooks/useIdempotencyKey";
import type {
  AdminNotification,
  BroadcastNotificationInput,
  NotificationCategoryValue,
  NotificationChannelValue,
  NotificationRoleValue,
} from "@/types";



type NotificationRow = {
  id: string;
  title: string;
  description: string;
  type: string;
  channels: string[];
  audience: string;
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
    audience: firstText(record, ["audience", "targetAudience", "recipientType"], "All Customers"),
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

const roleOptions: Array<{ value: NotificationRoleValue; label: string }> = [
  { value: "customer", label: "Customer" },
  { value: "mechanic", label: "Mechanic" },
  { value: "company_admin", label: "Company Admin" },
  { value: "sherix_admin", label: "Sherix Admin" },
  { value: "finance_admin", label: "Finance Admin" },
  { value: "human_resources_admin", label: "HR Admin" },
  { value: "customer_support_admin", label: "Customer Support Admin" },
  { value: "operations_admin", label: "Operations Admin" },
  { value: "marketing_admin", label: "Marketing Admin" },
  { value: "compliance_admin", label: "Compliance Admin" },
  { value: "technical_support_admin", label: "Technical Support Admin" },
  { value: "business_development_admin", label: "Business Development Admin" },
  
];

const channelOptions: Array<{ value: NotificationChannelValue; label: string }> = [
  { value: "push", label: "Push" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
];

const categoryOptions: Array<{ value: NotificationCategoryValue; label: string }> = [
  { value: "announcement", label: "Announcement" },
  { value: "reminder", label: "Reminder" },
  { value: "alert", label: "Alert" },
  { value: "promotion", label: "Promotion" },
  { value: "system", label: "System" },
  { value: "security", label: "Security" },
  { value: "job_update", label: "Request Update" },
];

type NotificationFormState = {
  title: string;
  description: string;
  roles: NotificationRoleValue[];
  channel: NotificationChannelValue;
  category: NotificationCategoryValue;
};

const initialNotificationForm: NotificationFormState = {
  title: "",
  description: "",
  roles: [],
  channel: "push",
  category: "announcement",
};

function validateNotificationForm(form: NotificationFormState) {
  const title = form.title.trim();
  const description = form.description.trim();
  if (title.length < 2 || title.length > 200) return "Title must be between 2 and 200 characters.";
  if (description.length < 2 || description.length > 2000) return "Description must be between 2 and 2000 characters.";
  if (form.roles.length === 0) return "Select at least one role.";
  return "";
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = window.setTimeout(onClose, 2800);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border bg-card p-4 text-sm font-bold shadow-2xl">
      {message}
    </div>
  );
}

function CreateNotificationModal({
  open,
  onOpenChange,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent: (message: string) => void;
}) {
  const broadcastNotification = useBroadcastNotification();
  const idempotencyKey = useIdempotencyKey(open);
  const [form, setForm] = React.useState<NotificationFormState>(initialNotificationForm);
  const [error, setError] = React.useState("");
  const pending = broadcastNotification.isPending;

  React.useEffect(() => {
    if (!open) return;
    setError("");
    setForm(initialNotificationForm);
  }, [open]);

  function setField<Key extends keyof NotificationFormState>(key: Key, value: NotificationFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleRole(role: NotificationRoleValue) {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((value) => value !== role)
        : [...current.roles, role],
    }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (broadcastNotification.isPending) return;
    const validationError = validateNotificationForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    try {
      const payload: BroadcastNotificationInput = {
        title: form.title.trim(),
        description: form.description.trim(),
        roles: form.roles,
        channel: form.channel,
        category: form.category,
      };
      const result = await broadcastNotification.mutateAsync({ input: payload, idempotencyKey });
      onSent(result.message ?? "Notification sent successfully.");
      onOpenChange(false);
    } catch (submitError) {
      setError(getMutationOutcomeMessage(submitError, "Sending this notification").message);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border bg-background shadow-2xl">
          <form onSubmit={submit} className="flex max-h-[92vh] flex-col">
            <div className="border-b p-5 pr-12">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </span>
                <div>
                  <DialogPrimitive.Title className="text-lg font-black">Create Notification</DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                    Broadcast an announcement, reminder, or alert to selected users.
                  </DialogPrimitive.Description>
                </div>
              </div>
              <DialogPrimitive.Close asChild>
                <Button type="button" variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogPrimitive.Close>
            </div>
            <div className="grid gap-5 overflow-y-auto p-5">
              <label className="grid gap-1.5 text-xs font-bold">
                Title
                <Input
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                  placeholder="Enter notification title"
                  required
                  minLength={2}
                  maxLength={200}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-bold">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                  placeholder="Write your notification message..."
                  required
                  minLength={2}
                  maxLength={2000}
                  className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>
              <div className="grid gap-1.5 text-xs font-bold">
                Audience
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {roleOptions.map((role) => {
                    const active = form.roles.includes(role.value);
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => toggleRole(role.value)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-xs font-bold transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-input bg-background hover:bg-muted",
                        )}
                      >
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-bold">
                  Channel
                  <Select value={form.channel} onValueChange={(value) => setField("channel", value as NotificationChannelValue)}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {channelOptions.map((channel) => (
                        <SelectItem key={channel.value} value={channel.value}>
                          {channel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="grid gap-1.5 text-xs font-bold">
                  Category
                  <Select value={form.category} onValueChange={(value) => setField("category", value as NotificationCategoryValue)}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categoryOptions.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
              )}
            </div>
            <div className="flex flex-col gap-3 border-t bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Notifications are delivered immediately to active users matching the selected roles.
              </p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Notification
                </Button>
              </div>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default function NotificationsPage() {
  const [query, setQuery] = React.useState("");
  const [channel, setChannel] = React.useState("All Channels");
  const [status, setStatus] = React.useState("All Status");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [toast, setToast] = React.useState("");
  const notificationsQuery = useNotifications();
  const rows = React.useMemo(() => (notificationsQuery.data ?? []).map(mapNotification), [notificationsQuery.data]);
  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !search || [row.title, row.description, row.type, row.audience, row.status, ...row.channels].join(" ").toLowerCase().includes(search);
      const matchesChannel = channel === "All Channels" || row.channels.some((item) => item.toLowerCase() === channel.toLowerCase());
      const matchesStatus = status === "All Status" || row.status.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [channel, query, rows, status]);
  const { data: notifications } = useNotifications();
  const metrics = React.useMemo(
    () => [
      { label: "Total Notifications", value: String(notifications?.length ?? 0), change: "Loaded from backend", direction: "up", tone: "red", icon: Bell },
      { label: "Sent", value: String(rows.filter((row) => row.status.toLowerCase().includes("sent")).length), change: "Loaded from backend", direction: "up", tone: "green", icon: Bell },
      { label: "Channels", value: String(new Set(rows.flatMap((row) => row.channels)).size), change: "Derived from backend", direction: "up", tone: "blue", icon: Upload },
    ],
    [rows],
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Notifications" subtitle="Create, manage and track all system notifications sent to customers and providers." />
      <MetricGrid metrics={metrics} />

      <div className="font-bold">All Notifications</div>

      <section className="grid gap-4 ">
        <CardShell>
          <ToolbarCard>
            <SearchBox placeholder="Search by title, type, audience or template..." value={query} onChange={setQuery} />
            <FilterSelect placeholder="All Channels" values={["All Channels", "Email", "SMS", "Push"]} value={channel} onChange={setChannel} />
            <Button onClick={() => setModalOpen(true)}>
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

      <CreateNotificationModal open={modalOpen} onOpenChange={setModalOpen} onSent={setToast} />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
