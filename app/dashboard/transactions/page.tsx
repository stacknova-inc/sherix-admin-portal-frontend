"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Banknote, CreditCard, KeyRound, Wallet } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  ExportButton,
  FilterSelect,
  MetricGrid,
  PaginationFooter,
  SearchBox,
  SoftTag,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { transactions, transactionsMetrics } from "@/lib/mock-data";

type TransactionRow = (typeof transactions)[number];

const typeTone: Record<string, string> = {
  Payment: "green",
  Payout: "blue",
  Refund: "amber",
  Commission: "purple",

};

function MethodCell({ method }: { method: string }) {
  const Icon = method === "Bank Transfer" ? Banknote : method === "Wallet Balance" ? Wallet : method === "Card Payment" ? CreditCard : KeyRound;
  return (
    <span className="flex min-w-[150px] items-center gap-2 font-semibold">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15">
        <Icon className="h-4 w-4" />
      </span>
      {method}
    </span>
  );
}

const transactionColumns: ColumnDef<TransactionRow>[] = [
  { accessorKey: "id", header: "Transaction ID", cell: ({ row }) => <span className="font-black">{row.original.id}</span> },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <SoftTag tone={typeTone[row.original.type]}>{row.original.type}</SoftTag>,
  },
  {
    accessorKey: "relatedTo",
    header: "Related To",
    cell: ({ row }) => (
      <div className="min-w-[160px]">
        <p className="font-bold">{row.original.relatedTo}</p>
        {row.original.detail && <p className="text-xs text-muted-foreground">{row.original.detail}</p>}
      </div>
    ),
  },
  {
    id: "fromTo",
    header: "From / To",
    cell: ({ row }) => (
      <div className="grid min-w-[300px] grid-cols-[1fr_24px_1fr] items-center gap-3">
        <div>
          <p className="font-bold">{row.original.from}</p>
          <p className="text-xs text-muted-foreground">{row.original.fromRole}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-bold">{row.original.to}</p>
          <p className="text-xs text-muted-foreground">{row.original.toRole}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "method", header: "Payment Method", cell: ({ row }) => <MethodCell method={row.original.method} /> },
  { accessorKey: "amount", header: "Amount", cell: ({ row }) => <span className="font-black">{row.original.amount}</span> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
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
  { id: "actions", header: "Actions", cell: () => <ActionMenu /> },
];

export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Transactions" subtitle="View and manage all platform transactions." />
      <MetricGrid metrics={transactionsMetrics} />

      <CardShell>
        <ToolbarCard>
          <SearchBox placeholder="Search by transaction ID, user, provider or job ID..." />
          <FilterSelect placeholder="All Types" values={["All Types", "Payment", "Payout", "Refund", "Commission"]} />
          <FilterSelect placeholder="All Statuses" values={["All Statuses", "Completed", "Pending"]} />
          <FilterSelect placeholder="All Payment Methods" values={["All Payment Methods", "Mobile Money", "Bank Transfer", "Card Payment"]} className="lg:w-[210px]" />
          <div className="flex gap-3">
            <ExportButton />
          </div>
        </ToolbarCard>
        <AdminDataTable data={transactions} columns={transactionColumns} minWidth="1320px" />
        <PaginationFooter label="Showing 1 to 10 of 1,256 transactions" pageCount="126" />
      </CardShell>
    </div>
  );
}
