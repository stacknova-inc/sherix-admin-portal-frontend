"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Briefcase, CheckCircle2, Clock3, RefreshCcw, XCircle } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { ExportButton, FilterSelect, MetricGrid, PaginationFooter, SearchBox, StatusCell, ToolbarCard } from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { useBookingStats, useBookings } from "@/hooks/useBookings";
import { activeStatus, asRecord, dateText, firstText, metricValue, money, recordId, text, timeText } from "@/lib/live-data";
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
  date: string;
  time: string;
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
    date: dateText(booking.createdAt),
    time: timeText(booking.createdAt),
  };
}

const bookingColumns: ColumnDef<BookingRow>[] = [
  { accessorKey: "id", header: "Job ID", cell: ({ row }) => <span className="font-black">{row.original.id}</span> },
  { accessorKey: "requestId", header: "Request ID" },
  { accessorKey: "service", header: "Service" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "provider", header: "Provider" },
  { accessorKey: "priority", header: "Priority" },
  { accessorKey: "paymentStatus", header: "Payment", cell: ({ row }) => <StatusCell status={row.original.paymentStatus} /> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { accessorKey: "amount", header: "Amount", cell: ({ row }) => <span className="font-black">{row.original.amount}</span> },
  {
    accessorKey: "date",
    header: "Date & Time",
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <p className="font-semibold">{row.original.date}</p>
        <p className="text-xs text-muted-foreground">{row.original.time}</p>
      </div>
    ),
  },
];

export default function JobsPage() {
  const bookingsQuery = useBookings();
  const statsQuery = useBookingStats();
  const rows = (bookingsQuery.data ?? []).map(mapBooking);
  const stats = asRecord(statsQuery.data);
  const metrics = [
    { label: "Total Requests", value: metricValue(stats, ["totalRequests", "totalBookings", "total"], String(rows.length)), change: "Live backend data", direction: "up", tone: "blue", icon: Briefcase },
    { label: "Pending Requests", value: metricValue(stats, ["pendingRequests", "pending"]), change: "Live backend data", direction: "down", tone: "amber", icon: Clock3 },
    { label: "In Progress", value: metricValue(stats, ["inProgress", "ongoing"]), change: "Live backend data", direction: "up", tone: "blue", icon: RefreshCcw },
    { label: "Completed Jobs", value: metricValue(stats, ["completedJobs", "completed"]), change: "Live backend data", direction: "up", tone: "green", icon: CheckCircle2 },
    { label: "Cancelled Jobs", value: metricValue(stats, ["cancelledJobs", "cancelled"]), change: "Live backend data", direction: "down", tone: "red", icon: XCircle },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Jobs & Requests" subtitle="Manage jobs, assignments, and ongoing requests across the platform." />
      <MetricGrid metrics={metrics} />
      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search by job ID, customer, provider or service..." />
          <FilterSelect placeholder="All Statuses" values={["All Statuses", "Pending", "Ongoing", "Completed", "Cancelled"]} />
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
          <AdminDataTable data={rows} columns={bookingColumns} minWidth="1320px" />
        )}
        <PaginationFooter label={`Showing ${rows.length ? `1 to ${rows.length}` : "0"} of ${rows.length} bookings`} pageCount={String(Math.max(1, Math.ceil(rows.length / 10)))} />
      </CardShell>
    </div>
  );
}
