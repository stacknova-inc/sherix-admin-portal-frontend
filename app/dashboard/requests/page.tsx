"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { Briefcase, CalendarX, CheckCircle2, Clock3, RefreshCcw, XCircle } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { ExportButton, FilterSelect, MetricGrid, PaginationFooter, SearchBox, StatusCell, ToolbarCard } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { useServiceRequestStats, useServiceRequests } from "@/hooks/useServiceRequests";
import { activeStatus, asRecord, firstText, metricChange, metricDirection, metricValue, money, recordId, text } from "@/lib/live-data";
import type { ServiceRequest } from "@/types";

type ServiceRequestRow = {
  id: string;
  requestId: string;
  service: string;
  customer: string;
  provider: string;
  location: string;
  amount: string;
  status: string;
  priority: string;
  paymentStatus: string;
};

function mapServiceRequest(serviceRequest: ServiceRequest): ServiceRequestRow {
  const record = serviceRequest as unknown as Record<string, unknown>;
  return {
    id: recordId(serviceRequest),
    requestId: firstText(record, ["requestId", "serviceRequestId", "bookingId"], recordId(serviceRequest)),
    service: text(record.service),
    customer: text(record.customer),
    provider: text(record.provider),
    location: firstText(record, ["location", "address"]),
    amount: money(record.amount ?? record.totalAmount),
    status: activeStatus(record, "Pending"),
    priority: firstText(record, ["priority"], "Normal"),
    paymentStatus: firstText(record, ["paymentStatus"], "Pending"),
  };
}

const serviceRequestColumns: ColumnDef<ServiceRequestRow>[] = [
  { accessorKey: "id", header: "Request ID", cell: ({ row }) => <span className="font-black">{row.original.id}</span> },
  { accessorKey: "service", header: "Service" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "provider", header: "Provider" },
  { accessorKey: "priority", header: "Priority" },
  { accessorKey: "paymentStatus", header: "Payment", cell: ({ row }) => <StatusCell status={row.original.paymentStatus} /> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { accessorKey: "amount", header: "Amount", cell: ({ row }) => <span className="font-black">{row.original.amount}</span> },
];

export default function RequestsPage() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All Statuses");
  const serviceRequestsQuery = useServiceRequests({ limit: 100 });
  const statsQuery = useServiceRequestStats();
  const rows = React.useMemo(() => (serviceRequestsQuery.data ?? []).map(mapServiceRequest), [serviceRequestsQuery.data]);
  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !search || [row.requestId, row.service, row.customer, row.provider, row.location, row.status, row.paymentStatus].join(" ").toLowerCase().includes(search);
      const matchesStatus = status === "All Statuses" || row.status.toLowerCase().includes(status.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [query, rows, status]);
  const stats = asRecord(statsQuery.data);
  const metrics = [
    { label: "Total Requests", value: metricValue(stats, ["totalRequests", "totalServiceRequests", "totalBookings", "total"], String(rows.length)), change: metricChange(stats, ["totalRequests", "totalServiceRequests", "totalBookings", "total"]), direction: metricDirection(stats, ["totalRequests", "totalServiceRequests", "totalBookings", "total"]), tone: "blue", icon: Briefcase },
    { label: "Pending Requests", value: metricValue(stats, ["pendingRequests", "pending"]), change: metricChange(stats, ["pendingRequests", "pending"]), direction: metricDirection(stats, ["pendingRequests", "pending"], "down"), tone: "amber", icon: Clock3 },
    { label: "Completed Requests", value: metricValue(stats, ["completedJobs", "completed"]), change: metricChange(stats, ["completedJobs", "completed"]), direction: metricDirection(stats, ["completedJobs", "completed"]), tone: "green", icon: CheckCircle2 },
    { label: "InProgress Requests", value: metricValue(stats, ["inProgressJobs", "inProgress"], String(rows.filter((row) => row.status.toLowerCase() === "in progress").length)), change: metricChange(stats, ["inProgressJobs", "inProgress"]), direction: metricDirection(stats, ["inProgressJobs", "inProgress"], "down"), tone: "purple", icon: CalendarX },
      { label: "Expired Requests", value: metricValue(stats, ["expiredJobs", "expired"], String(rows.filter((row) => row.status.toLowerCase() === "expired").length)), change: metricChange(stats, ["expiredJobs", "expired"]), direction: metricDirection(stats, ["expiredJobs", "expired"], "down"), tone: "red", icon: CalendarX },

  ];

  const exportData = React.useMemo(
    () =>
      filteredRows.map(({ id, requestId, service, customer, provider, location, amount, status, priority, paymentStatus }) => ({
        id,
        requestId,
        service,
        customer,     provider,
        location,
        amount,
        status,
        priority,
        paymentStatus,
      })),
    [filteredRows],
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Requests" subtitle="Manage requests, assignments, and their progress across the platform." />
      <MetricGrid metrics={metrics} />
      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search by request, customer, provider or service..." value={query} onChange={setQuery} />
          <FilterSelect placeholder="All Statuses" values={["All Statuses", "Pending", "Completed", "Expired"]} value={status} onChange={setStatus} />
          <div className="flex gap-3">
            <ExportButton data={exportData} filename="requests" />
          </div>
        </ToolbarCard>
        {serviceRequestsQuery.isLoading ? (
          <div className="p-6 text-sm font-semibold text-muted-foreground">Loading service requests...</div>
        ) : serviceRequestsQuery.isError ? (
          <div className="p-6 text-sm font-semibold text-red-600">Unable to load service requests.</div>
        ) : (
          <AdminDataTable data={filteredRows} columns={serviceRequestColumns} minWidth="1320px" rowLabel="service requests" />
        )}
      </CardShell>
    </div>
  );
}
