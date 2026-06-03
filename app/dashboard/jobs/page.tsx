"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { Briefcase, CheckCircle2, Clock3, RefreshCcw, XCircle } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { ExportButton, FilterSelect, MetricGrid, PaginationFooter, SearchBox, StatusCell, ToolbarCard } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { useBookingStats, useBookings } from "@/hooks/useBookings";
import { activeStatus, asRecord, firstText, metricChange, metricDirection, metricValue, money, recordId, text } from "@/lib/live-data";
import type { Booking } from "@/types";

type BookingRow = {
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

function mapBooking(booking: Booking): BookingRow {
  const record = booking as unknown as Record<string, unknown>;
  return {
    id: recordId(booking),
    requestId: firstText(record, ["requestId", "bookingId"], recordId(booking)),
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

const bookingColumns: ColumnDef<BookingRow>[] = [
  { accessorKey: "id", header: "Job ID", cell: ({ row }) => <span className="font-black">{row.original.id}</span> },
  { accessorKey: "service", header: "Service" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "provider", header: "Provider" },
  { accessorKey: "priority", header: "Priority" },
  { accessorKey: "paymentStatus", header: "Payment", cell: ({ row }) => <StatusCell status={row.original.paymentStatus} /> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { accessorKey: "amount", header: "Amount", cell: ({ row }) => <span className="font-black">{row.original.amount}</span> },
];

export default function JobsPage() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All Statuses");
  const bookingsQuery = useBookings();
  const statsQuery = useBookingStats();
  const rows = React.useMemo(() => (bookingsQuery.data ?? []).map(mapBooking), [bookingsQuery.data]);
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
    { label: "Total Requests", value: metricValue(stats, ["totalRequests", "totalBookings", "total"], String(rows.length)), change: metricChange(stats, ["totalRequests", "totalBookings", "total"]), direction: metricDirection(stats, ["totalRequests", "totalBookings", "total"]), tone: "blue", icon: Briefcase },
    { label: "Pending Requests", value: metricValue(stats, ["pendingRequests", "pending"]), change: metricChange(stats, ["pendingRequests", "pending"]), direction: metricDirection(stats, ["pendingRequests", "pending"], "down"), tone: "amber", icon: Clock3 },
    { label: "In Progress", value: metricValue(stats, ["inProgress", "ongoing"]), change: metricChange(stats, ["inProgress", "ongoing"]), direction: metricDirection(stats, ["inProgress", "ongoing"]), tone: "blue", icon: RefreshCcw },
    { label: "Completed Jobs", value: metricValue(stats, ["completedJobs", "completed"]), change: metricChange(stats, ["completedJobs", "completed"]), direction: metricDirection(stats, ["completedJobs", "completed"]), tone: "green", icon: CheckCircle2 },
    { label: "Cancelled Jobs", value: metricValue(stats, ["cancelledJobs", "cancelled"]), change: metricChange(stats, ["cancelledJobs", "cancelled"]), direction: metricDirection(stats, ["cancelledJobs", "cancelled"], "down"), tone: "red", icon: XCircle },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Jobs & Requests" subtitle="Manage jobs, assignments, and ongoing requests across the platform." />
      <MetricGrid metrics={metrics} />
      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search by job, customer, provider or service..." value={query} onChange={setQuery} />
          <FilterSelect placeholder="All Statuses" values={["All Statuses", "Pending", "Ongoing", "Completed", "Cancelled"]} value={status} onChange={setStatus} />
          <FilterSelect placeholder="All Services" values={["All Services"]} />
          <div className="flex gap-3">
            <ExportButton />
          </div>
        </ToolbarCard>
        {bookingsQuery.isLoading ? (
          <div className="p-6 text-sm font-semibold text-muted-foreground">Loading bookings...</div>
        ) : bookingsQuery.isError ? (
          <div className="p-6 text-sm font-semibold text-red-600">Unable to load bookings.</div>
        ) : (
          <AdminDataTable data={filteredRows} columns={bookingColumns} minWidth="1320px" rowLabel="bookings" />
        )}
      </CardShell>
    </div>
  );
}
