"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Banknote, Briefcase, CreditCard, DollarSign, KeyRound, Wallet, WalletCards } from "lucide-react";
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
import { useTransactions } from "@/hooks/useFinancial";
import { activeStatus, asRecord, dateText, firstText, money, recordId, text, timeText } from "@/lib/live-data";
import type { Transaction } from "@/types";

type TransactionRow = {
  id: string;
  type: string;
  relatedTo: string;
  detail?: string;
  from: string;
  fromRole: string;
  to: string;
  toRole: string;
  method: string;
  amount: string;
  status: string;
  date: string;
  time: string;
};

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
  const transactionsQuery = useTransactions();
  const rows: TransactionRow[] = (transactionsQuery.data ?? []).map((transaction: Transaction) => {
    const record = transaction as unknown as Record<string, unknown>;
    const from = asRecord(record.from);
    const to = asRecord(record.to);
    return {
      id: recordId(transaction),
      type: firstText(record, ["type"], "Payment"),
      relatedTo: firstText(record, ["relatedTo", "bookingId", "jobId"], "-"),
      detail: firstText(record, ["detail", "description"], ""),
      from: text(record.from),
      fromRole: firstText(from, ["role", "type"], "Sender"),
      to: text(record.to),
      toRole: firstText(to, ["role", "type"], "Recipient"),
      method: firstText(record, ["method", "paymentMethod"], "Mobile Money"),
      amount: money(record.amount),
      status: activeStatus(record, "Pending"),
      date: dateText(transaction.createdAt),
      time: timeText(transaction.createdAt),
    };
  });
  const total = rows.reduce((sum, row) => sum + Number(row.amount.replace(/[^\d.]/g, "")), 0);
  const metrics = [
    { label: "Total Transactions", value: money(total), change: "Live backend data", direction: "up", tone: "purple", icon: DollarSign },
    { label: "Total Amount In", value: money(total), change: "Live backend data", direction: "up", tone: "green", icon: Wallet },
    { label: "Total Amount Out", value: money(0), change: "Live backend data", direction: "down", tone: "amber", icon: WalletCards },
    { label: "Refunds Issued", value: money(rows.filter((row) => row.type.toLowerCase().includes("refund")).reduce((sum, row) => sum + Number(row.amount.replace(/[^\d.]/g, "")), 0)), change: "Live backend data", direction: "down", tone: "blue", icon: Briefcase },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Transactions" subtitle="View and manage all platform transactions." />
      <MetricGrid metrics={metrics} />

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
        {transactionsQuery.isLoading ? (
          <div className="p-6 text-sm font-semibold text-muted-foreground">Loading transactions...</div>
        ) : transactionsQuery.isError ? (
          <div className="p-6 text-sm font-semibold text-red-600">Unable to load transactions.</div>
        ) : (
          <AdminDataTable data={rows} columns={transactionColumns} minWidth="1320px" />
        )}
        <PaginationFooter label={`Showing ${rows.length ? `1 to ${rows.length}` : "0"} of ${rows.length} transactions`} pageCount={String(Math.max(1, Math.ceil(rows.length / 10)))} />
      </CardShell>
    </div>
  );
}
