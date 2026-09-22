"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { AlertTriangle, CheckCircle2, Clock3, LifeBuoy } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  FilterSelect,
  InitialAvatar,
  MetricGrid,
  SearchBox,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TicketRow = {
  id: string;
  ticketId: string;
  subject: string;
  requesterType: string;
  requesterName: string;
  requesterInitials: string;
  priority: string;
  category: string;
  status: string;
  assignee: string;
  createdOn: string;
  time: string;
};

const dummyTickets: TicketRow[] = [
  {
    id: "1",
    ticketId: "TKT-1001",
    subject: "Unable to complete service request",
    requesterType: "customer",
    requesterName: "Ama Mensah",
    requesterInitials: "AM",
    priority: "high",
    category: "service_request",
    status: "open",
    assignee: "Kwame Asante",
    createdOn: "2026-09-20",
    time: "10:30 AM",
  },
  {
    id: "2",
    ticketId: "TKT-1002",
    subject: "Payment was charged twice",
    requesterType: "customer",
    requesterName: "John Kofi",
    requesterInitials: "JK",
    priority: "urgent",
    category: "billing",
    status: "in_progress",
    assignee: "Ama Boateng",
    createdOn: "2026-09-19",
    time: "02:15 PM",
  },
  {
    id: "3",
    ticketId: "TKT-1003",
    subject: "Unable to update company documents",
    requesterType: "company",
    requesterName: "AutoCare Ghana",
    requesterInitials: "AG",
    priority: "medium",
    category: "account",
    status: "pending_customer",
    assignee: "Kwame Asante",
    createdOn: "2026-09-18",
    time: "09:45 AM",
  },
  {
    id: "4",
    ticketId: "TKT-1004",
    subject: "App keeps showing an error",
    requesterType: "mechanic",
    requesterName: "Kofi Mensah",
    requesterInitials: "KM",
    priority: "high",
    category: "technical",
    status: "open",
    assignee: "Unassigned",
    createdOn: "2026-09-17",
    time: "04:20 PM",
  },
  {
    id: "5",
    ticketId: "TKT-1005",
    subject: "Question about service commission",
    requesterType: "mechanic",
    requesterName: "Yaw Owusu",
    requesterInitials: "YO",
    priority: "low",
    category: "billing",
    status: "resolved",
    assignee: "Ama Boateng",
    createdOn: "2026-09-16",
    time: "11:10 AM",
  },
  {
    id: "6",
    ticketId: "TKT-1006",
    subject: "Customer dispute needs clarification",
    requesterType: "customer",
    requesterName: "Akua Asante",
    requesterInitials: "AA",
    priority: "urgent",
    category: "safety",
    status: "in_progress",
    assignee: "Kwame Asante",
    createdOn: "2026-09-15",
    time: "01:35 PM",
  },
  {
    id: "7",
    ticketId: "TKT-1007",
    subject: "Request to update account information",
    requesterType: "company",
    requesterName: "Prime Auto Services",
    requesterInitials: "PA",
    priority: "medium",
    category: "account",
    status: "closed",
    assignee: "Ama Boateng",
    createdOn: "2026-09-14",
    time: "08:50 AM",
  },
  {
    id: "8",
    ticketId: "TKT-1008",
    subject: "Service request was cancelled unexpectedly",
    requesterType: "customer",
    requesterName: "Esi Mensah",
    requesterInitials: "EM",
    priority: "high",
    category: "service_request",
    status: "open",
    assignee: "Unassigned",
    createdOn: "2026-09-13",
    time: "03:05 PM",
  },
];

const requesterTypeOptions = [
  "All Requester Types",
  "Customer",
  "Mechanic",
  "Company",
];

const statusOptions = [
  "All Statuses",
  "Open",
  "In Progress",
  "Pending Customer",
  "Resolved",
  "Closed",
];

const priorityOptions = [
  "All Priorities",
  "Low",
  "Medium",
  "High",
  "Urgent",
];

const categoryOptions = [
  "All Categories",
  "Billing",
  "Account",
  "Service Request",
  "Technical",
  "Safety",
  "Other",
];

const assigneeOptions = [
  "All Assignees",
  "Unassigned",
  "Kwame Asante",
  "Ama Boateng",
];

function toParam(value: string) {
  return value.toLowerCase().replace(/\s+/g, "_");
}

const ticketColumns: ColumnDef<TicketRow>[] = [
  {
    accessorKey: "ticketId",
    header: "Ticket",
    cell: ({ row }) => (
      <div className="min-w-[160px]">
        <Link
          href={`/dashboard/support-tickets/${row.original.id}`}
          className="font-black hover:text-primary"
        >
          {row.original.ticketId}
        </Link>
        <p className="text-xs text-muted-foreground">
          {row.original.subject}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "requesterName",
    header: "Requester",
    cell: ({ row }) => (
      <div className="flex min-w-[170px] items-center gap-3">
        <InitialAvatar initials={row.original.requesterInitials} />
        <div>
          <p className="font-bold">{row.original.requesterName}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {row.original.requesterType}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="font-semibold capitalize">
        {row.original.category.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <StatusCell status={row.original.priority} />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusCell status={row.original.status} />
    ),
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
  },
  {
    accessorKey: "createdOn",
    header: "Created",
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <p className="font-semibold">{row.original.createdOn}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.time}
        </p>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button asChild variant="ghost" size="sm">
        <Link href={`/dashboard/support-tickets/${row.original.id}`}>
          View
        </Link>
      </Button>
    ),
  },
];

function SupportTicketsPageInner() {
  const searchParams = useSearchParams();

  const [query, setQuery] = React.useState("");
  const [requesterType, setRequesterType] = React.useState(
    "All Requester Types",
  );

  const [status, setStatus] = React.useState(() => {
    const param = searchParams.get("status");

    if (!param) {
      return "All Statuses";
    }

    const match = statusOptions.find(
      (option) => toParam(option) === param,
    );

    return match ?? "All Statuses";
  });

  const [priority, setPriority] = React.useState("All Priorities");
  const [category, setCategory] = React.useState("All Categories");
  const [assignee, setAssignee] = React.useState("All Assignees");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  const rows = dummyTickets;

  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !search ||
        [
          row.ticketId,
          row.subject,
          row.requesterName,
          row.category,
          row.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);

      const matchesRequesterType =
        requesterType === "All Requester Types" ||
        row.requesterType.toLowerCase() === toParam(requesterType);

      const matchesStatus =
        status === "All Statuses" ||
        row.status.toLowerCase() === toParam(status);

      const matchesPriority =
        priority === "All Priorities" ||
        row.priority.toLowerCase() === toParam(priority);

      const matchesCategory =
        category === "All Categories" ||
        row.category.toLowerCase() === toParam(category);

      const matchesAssignee =
        assignee === "All Assignees" ||
        row.assignee === assignee ||
        (assignee === "Unassigned" &&
          row.assignee === "Unassigned");

      const matchesStart =
        !startDate ||
        new Date(row.createdOn) >= new Date(startDate);

      const matchesEnd =
        !endDate ||
        new Date(row.createdOn) <= new Date(endDate);

      return (
        matchesSearch &&
        matchesRequesterType &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory &&
        matchesAssignee &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [
    assignee,
    category,
    endDate,
    priority,
    query,
    requesterType,
    startDate,
    status,
    rows,
  ]);

  const metrics = [
    {
      label: "Total Tickets",
      value: String(rows.length),
      change: "Dummy data",
      direction: "up",
      tone: "purple",
      icon: LifeBuoy,
    },
    {
      label: "Open",
      value: String(
        rows.filter((ticket) => ticket.status === "open").length,
      ),
      change: "Dummy data",
      direction: "down",
      tone: "amber",
      icon: Clock3,
    },
    {
      label: "Urgent",
      value: String(
        rows.filter((ticket) => ticket.priority === "urgent").length,
      ),
      change: "Dummy data",
      direction: "down",
      tone: "red",
      icon: AlertTriangle,
    },
    {
      label: "Resolved",
      value: String(
        rows.filter((ticket) => ticket.status === "resolved").length,
      ),
      change: "Dummy data",
      direction: "up",
      tone: "green",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="mx-auto max-w-full space-y-5">
      <PageHeader
        title="Support Tickets"
        subtitle="Filter, triage, and respond to support tickets raised by customers, mechanics, and companies."
      />

      <MetricGrid metrics={metrics} />

      <section className="grid gap-4">
        <CardShell>
          <ToolbarCard>
            <SearchBox
              placeholder="Search by ticket, requester, or subject..."
              value={query}
              onChange={setQuery}
            />

            <FilterSelect
              placeholder="Requester Type"
              values={requesterTypeOptions}
              value={requesterType}
              onChange={setRequesterType}
            />

            <FilterSelect
              placeholder="Status"
              values={statusOptions}
              value={status}
              onChange={setStatus}
            />

            <FilterSelect
              placeholder="Priority"
              values={priorityOptions}
              value={priority}
              onChange={setPriority}
            />
          </ToolbarCard>

          <ToolbarCard>
            <FilterSelect
              placeholder="Category"
              values={categoryOptions}
              value={category}
              onChange={setCategory}
            />

            <FilterSelect
              placeholder="Assignee"
              values={assigneeOptions}
              value={assignee}
              onChange={setAssignee}
            />

            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              From
              <Input
                type="date"
                className="h-9 w-[150px] bg-card"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                aria-label="Created from date"
              />
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              To
              <Input
                type="date"
                className="h-9 w-[150px] bg-card"
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                aria-label="Created to date"
              />
            </label>

            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Clear dates
              </Button>
            )}
          </ToolbarCard>

          {!filteredRows.length ? (
            <div className="p-4">
              <EmptyState
                title="No support tickets found"
                description="Try a different search or filter combination."
              />
            </div>
          ) : (
            <AdminDataTable
              data={filteredRows}
              columns={ticketColumns}
              rowLabel="tickets"
              minWidth="1180px"
            />
          )}
        </CardShell>
      </section>
    </div>
  );
}

export default function SupportTicketsPage() {
  return (
    <React.Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          className="p-6 text-sm font-semibold text-muted-foreground"
        >
          Loading support tickets...
        </div>
      }
    >
      <SupportTicketsPageInner />
    </React.Suspense>
  );
}