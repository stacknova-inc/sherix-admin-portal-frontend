"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import {
  Clock3, Loader2, MapPin, MoreVertical,
  ShieldCheck, UserCheck, UserRoundX, Users, XCircle, Wrench,
} from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ExportButton, FilterSelect, MetricGrid, PersonCell,
  SearchBox, ServiceTags, StatusCell, ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/api";
import { activeStatus, asRecord, firstText, initials, metricChange, metricDirection, metricValue, recordId, text, uniqueRecordIds } from "@/lib/live-data";
import { useIndividualMechanics, useIndividualMechanicStats, useIndividualMechanicAction } from "@/hooks/useMechanics";
import type { Company } from "@/types";

type MechanicRow = {
  id: string;
  actionId: string;
  name: string;
  email: string;
  services: string[];
  extraServices: number;
  phone: string;
  location: string;
  status: string;
  initials: string;
  avatarTone: string;
};

function serviceLabel(service: unknown) {
  if (typeof service === "string") return service;
  const record = asRecord(service);
  return text(record.name ?? record.title ?? record.serviceName ?? record.categoryName ?? record.label ?? record.issueTitle, "");
}

function collectServices(...sources: unknown[]) {
  const services = sources.flatMap((source) => {
    if (!source) return [];
    if (Array.isArray(source)) return source.map(serviceLabel);
    return [serviceLabel(source)];
  });
  return Array.from(new Set(services.map((s) => s.trim()).filter(Boolean)));
}

function mapMechanic(item: Company): MechanicRow {
  const root = item as unknown as Record<string, unknown>;
  const nested = asRecord(root.mechanic ?? root.provider ?? root.serviceProvider ?? root.user);
  const record = { ...root, ...nested };
  const name = firstText(record, ["name", "fullName", "firstName"], text(nested, "Unnamed mechanic"));
  const ids = uniqueRecordIds(root.userId, root.mechanicId, root.providerId, root.user, nested, item);
  const allServices = collectServices(
    record.services, record.service, record.serviceOffered,
    record.serviceCategories, record.specializations, record.skills,
    asRecord(record.profile).services,
  );
  return {
    id: recordId(item) || String(root.providerId ?? root.mechanicId ?? root.userId ?? ""),
    actionId: ids[0] ?? "",
    name,
    email: firstText(record, ["email"]),
    services: allServices.slice(0, 2),
    extraServices: Math.max(0, allServices.length - 2),
    phone: firstText(record, ["phone", "phoneNumber"]),
    location: firstText(record, ["location", "address"]),
    status: activeStatus(record),
    initials: initials(name),
    avatarTone: "bg-blue-600 text-white",
  };
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(timer);
  }, [onClose]);
  return <div className="fixed bottom-5 right-5 z-50 rounded-xl border bg-card p-4 text-sm font-bold shadow-2xl">{message}</div>;
}

function MechanicActions({ mechanic, onToast }: { mechanic: MechanicRow; onToast: (msg: string) => void }) {
  const action = useIndividualMechanicAction();

  async function runAction(nextAction: "suspend" | "activate") {
    try {
      const reason = nextAction === "suspend" ? window.prompt("Reason for suspension") ?? undefined : undefined;
      await action.mutateAsync({ id: mechanic.actionId || mechanic.id, action: nextAction, reason });
      onToast(`Mechanic ${nextAction === "activate" ? "activated" : "suspended"} successfully.`);
    } catch (error) {
      onToast(getErrorMessage(error, `Unable to ${nextAction} mechanic`));
    }
  }

  const suspended = mechanic.status.toLowerCase().includes("suspend") || mechanic.status.toLowerCase().includes("inactive");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={action.isPending}>
          {action.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem onClick={() => runAction(suspended ? "activate" : "suspend")} disabled={action.isPending}>
          {suspended ? <UserCheck className="h-4 w-4" /> : <UserRoundX className="h-4 w-4" />}
          {suspended ? "Activate Mechanic" : "Suspend Mechanic"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const mechanicColumns = (onToast: (msg: string) => void): ColumnDef<MechanicRow>[] => [
  { accessorKey: "id", header: "Mechanic ID", cell: ({ row }) => <span className="font-semibold">{row.original.id}</span> },
  {
    accessorKey: "name", header: "Mechanic",
    cell: ({ row }) => <PersonCell name={row.original.name} sub={row.original.email} initials={row.original.initials} avatarTone={row.original.avatarTone} />,
  },
  {
    accessorKey: "services", header: "Service(s)",
    cell: ({ row }) => row.original.services.length
      ? <ServiceTags services={row.original.services} extra={row.original.extraServices} />
      : <span className="text-xs font-semibold text-muted-foreground">No services listed</span>,
  },
  { accessorKey: "phone", header: "Phone" },
  {
    accessorKey: "location", header: "Location",
    cell: ({ row }) => (
      <span className="flex min-w-[160px] items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />{row.original.location}
      </span>
    ),
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { id: "actions", header: "Actions", cell: ({ row }) => <MechanicActions mechanic={row.original} onToast={onToast} /> },
];

export default function IndividualMechanicsPage() {
  const [toast, setToast] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All Status");

  const mechanicsQuery = useIndividualMechanics();
  const statsQuery = useIndividualMechanicStats();

  const rows = React.useMemo(() => (mechanicsQuery.data ?? []).map(mapMechanic), [mechanicsQuery.data]);
  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !search || [row.name, row.email, row.phone, row.location, row.status, ...row.services].join(" ").toLowerCase().includes(search);
      const matchesStatus = status === "All Status" || row.status.toLowerCase().includes(status.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [query, rows, status]);

  const stats = asRecord(statsQuery.data);
  const metrics = [
    { label: "Total Mechanics", value: metricValue(stats, ["total", "totalMechanics"], String(rows.length)), change: metricChange(stats, ["total", "totalMechanics"]), direction: metricDirection(stats, ["total", "totalMechanics"]), tone: "red", icon: Users },
    { label: "Approved", value: metricValue(stats, ["approved", "approvedMechanics"], String(rows.filter((r) => r.status.toLowerCase().includes("approved") || r.status.toLowerCase().includes("verified")).length)), change: metricChange(stats, ["approved"]), direction: metricDirection(stats, ["approved"]), tone: "green", icon: ShieldCheck },
    { label: "Pending Verification", value: metricValue(stats, ["pending", "pendingMechanics"], String(rows.filter((r) => r.status.toLowerCase().includes("pending")).length)), change: metricChange(stats, ["pending"]), direction: metricDirection(stats, ["pending"]), tone: "amber", icon: Clock3 },
    { label: "Rejected", value: metricValue(stats, ["rejected", "rejectedMechanics"], String(rows.filter((r) => r.status.toLowerCase().includes("reject")).length)), change: metricChange(stats, ["rejected"]), direction: metricDirection(stats, ["rejected"]), tone: "red", icon: XCircle },
    { label: "Active Mechanics", value: metricValue(stats, ["active", "activeMechanics"], String(rows.filter((r) => r.status.toLowerCase().includes("active")).length)), change: metricChange(stats, ["active"]), direction: metricDirection(stats, ["active"]), tone: "blue", icon: Wrench },
  ];



  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Individual Mechanics" subtitle="Manage and verify individual mechanic service providers." />
      <MetricGrid metrics={metrics} />
      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search mechanics by name, email, phone or service..." value={query} onChange={setQuery} />
          <FilterSelect placeholder="All Status" values={["All Status", "Verified", "Pending", "Rejected"]} value={status} onChange={setStatus} />
          <FilterSelect placeholder="All Services" values={["All Services", "Battery", "Diagnostics", "Tire Change", "Towing"]} />
          <FilterSelect placeholder="Location" values={["Location", "Accra", "Tema", "Kasoa", "Madina"]} />
          {/* <ExportButton data={exportData} filename="individual-mechanics" /> */}
        </ToolbarCard>
        {mechanicsQuery.isLoading ? (
          <div className="p-6 text-sm font-semibold text-muted-foreground">Loading mechanics...</div>
        ) : mechanicsQuery.isError ? (
          <div className="p-6 text-sm font-semibold text-red-600">Unable to load mechanics.</div>
        ) : (
          <AdminDataTable data={filteredRows} columns={mechanicColumns(setToast)} minWidth="1340px" rowLabel="mechanics" />
        )}
      </CardShell>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
