"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, Loader2, Pencil, Plus } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import { CardShell } from "@/components/shared/CardShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusCell } from "@/components/shared/AdminPrimitives";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateDisputeReason, useDisputeReasons, useUpdateDisputeReason } from "@/hooks/useDisputeReasons";
import { getErrorMessage } from "@/lib/api";
import { recordId } from "@/lib/live-data";
import { hasPermission, Permission } from "@/lib/rbac";
import { useUiStore } from "@/store/use-ui-store";
import type { ColumnDef } from "@tanstack/react-table";
import type { DisputeReason } from "@/types";

function ReasonDialog({ reason, onClose }: { reason?: DisputeReason; onClose: () => void }) {
  const create = useCreateDisputeReason(); const update = useUpdateDisputeReason(); const [title, setTitle] = React.useState(reason?.title ?? ""); const [isActive, setIsActive] = React.useState(reason?.isActive ?? true); const [error, setError] = React.useState(""); const editing = Boolean(reason); const pending = create.isPending || update.isPending;
  async function submit() { if (!title.trim()) { setError("A reason title is required."); return; } try { if (reason) await update.mutateAsync({ id: recordId(reason), input: { title: title.trim(), isActive } }); else await create.mutateAsync({ title: title.trim(), isActive }); onClose(); } catch (cause) { setError(getErrorMessage(cause, "Unable to save dispute reason.")); } }
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>{editing ? "Edit dispute reason" : "Add dispute reason"}</DialogTitle><DialogDescription>Reasons are used when recording a dispute. Title and active state are sent to the admin dispute-reasons API.</DialogDescription></DialogHeader><label className="block text-sm font-semibold">Title<Input className="mt-1" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Overcharged for service" autoFocus /></label><div className="flex items-center justify-between rounded-lg border p-3"><div><p className="text-sm font-semibold">Active</p><p className="text-xs text-muted-foreground">Inactive reasons stay in the list but should not be selectable for new disputes.</p></div><Button type="button" variant={isActive ? "default" : "outline"} size="sm" onClick={() => setIsActive((value) => !value)} aria-pressed={isActive}>{isActive ? "Active" : "Inactive"}</Button></div>{error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}<DialogFooter><Button variant="outline" onClick={onClose} disabled={pending}>Cancel</Button><Button onClick={() => void submit()} disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}{editing ? "Save reason" : "Add reason"}</Button></DialogFooter></DialogContent></Dialog>;
}

export default function DisputeReasonsPage() {
  const reasons = useDisputeReasons(); const role = useUiStore((state) => state.role ?? state.user?.role); const canManage = hasPermission(role, Permission.DISPUTES); const [editing, setEditing] = React.useState<DisputeReason | null | undefined>(undefined);
  const columns = React.useMemo<ColumnDef<DisputeReason>[]>(() => [{ accessorKey: "title", header: "Reason", cell: ({ row }) => <b>{row.original.title}</b> }, { accessorKey: "isActive", header: "Status", cell: ({ row }) => <StatusCell status={row.original.isActive ? "Active" : "Inactive"} /> }, { id: "actions", header: "Actions", cell: ({ row }) => <Button size="sm" variant="ghost" disabled={!canManage} onClick={() => setEditing(row.original)}><Pencil className="h-4 w-4" />Edit</Button> }], [canManage]);
  return <div className="mx-auto max-w-4xl space-y-5"><Button asChild variant="ghost"><Link href="/dashboard/disputes"><ArrowLeft className="h-4 w-4" />Back to disputes</Link></Button><div className="flex flex-wrap items-start justify-between gap-3"><PageHeader title="Dispute Reasons" subtitle="Manage the active reason options returned by the admin API." /><Button disabled={!canManage} onClick={() => setEditing(null)}><Plus className="h-4 w-4" />Add dispute reason</Button></div><CardShell className="p-4">{reasons.isLoading ? <p className="p-4 text-sm font-semibold text-muted-foreground">Loading dispute reasons…</p> : reasons.isError ? <div className="p-4 text-sm font-semibold text-red-600">Unable to load dispute reasons. <Button size="sm" variant="outline" onClick={() => void reasons.refetch()}>Retry</Button></div> : reasons.data?.length ? <AdminDataTable data={reasons.data} columns={columns} rowLabel="reasons" minWidth="600px" /> : <EmptyState title="No dispute reasons" description="Create the first active reason for administrators to use." />}</CardShell>{editing !== undefined && <ReasonDialog reason={editing ?? undefined} onClose={() => setEditing(undefined)} />}</div>;
}
