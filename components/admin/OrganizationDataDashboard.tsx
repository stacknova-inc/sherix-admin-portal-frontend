"use client";

import * as React from "react";
import {
  CalendarClock,
  CheckCircle2,
  CloudUpload,
  Download,
  Eye,
  FileArchive,
  FileText,
  Gavel,
  ImagePlus,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { getErrorMessage } from "@/lib/api";
import { activeStatus, asRecord, dateText, firstText, recordId, text } from "@/lib/live-data";
import { cn } from "@/lib/utils";
import { useAdCampaign, useAdCampaigns, useCreateAdCampaign, useDeleteAdCampaign, useToggleAdCampaignStatus, useUpdateAdCampaign } from "@/hooks/useAdCampaigns";
import { useLegalDocuments, useUploadLegalDocument } from "@/hooks/useLegalDocuments";
import type { AdCampaign, LegalDocument } from "@/types";

type ModalType = "campaign-create" | "campaign-edit" | "legal-upload" | "legal-replace" | null;

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/15 dark:text-emerald-300",
  Inactive: "bg-slate-100 text-slate-700 ring-slate-600/15 dark:bg-slate-500/15 dark:text-slate-300",
  Suspended: "bg-slate-100 text-slate-700 ring-slate-600/15 dark:bg-slate-500/15 dark:text-slate-300",
  Draft: "bg-slate-100 text-slate-700 ring-slate-600/15 dark:bg-slate-500/15 dark:text-slate-300",
  Open: "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/15 dark:text-amber-300",
  Live: "bg-red-50 text-primary ring-primary/15 dark:bg-red-500/15 dark:text-red-300",
  Scheduled: "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-500/15 dark:text-blue-300",
};

function StatusBadge({ status }: { status: string }) {
  return <Badge className={cn("ring-1", statusStyles[status] ?? statusStyles.Draft)}>{status}</Badge>;
}

function TableLoading({ columns }: { columns: number }) {
  return (
    <tbody className="divide-y">
      {Array.from({ length: 5 }, (_, row) => (
        <tr key={row} className="bg-card">
          {Array.from({ length: columns }, (_, column) => (
            <td key={column} className="px-5 py-4">
              <div className="h-4 w-full max-w-40 animate-pulse rounded bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function ModalShell({
  title,
  subtitle,
  open,
  onClose,
  children,
  maxWidth = "max-w-2xl",
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm animate-in fade-in-0">
      <div className={cn("w-full overflow-hidden rounded-xl border bg-background shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4", maxWidth)}>
        <div className="flex items-start justify-between gap-4 border-b bg-card p-5">
          <div>
            <h2 className="text-lg font-black tracking-normal">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, error, children, hint }: { label: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      <span>{label}</span>
      {children}
      {(error || hint) && <span className={cn("text-xs", error ? "text-red-600" : "text-muted-foreground")}>{error ?? hint}</span>}
    </label>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border bg-card p-4 text-sm font-bold shadow-2xl animate-in slide-in-from-bottom-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">{message}</span>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label="Dismiss notification">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function FileDropZone({
  file,
  accept,
  title,
  description,
  onFile,
}: {
  file?: File;
  accept: string;
  title: string;
  description: string;
  onFile: (file: File) => void;
}) {
  return (
    <label
      className="grid cursor-pointer place-items-center rounded-xl border border-dashed bg-muted/35 p-8 text-center transition hover:border-primary hover:bg-primary/5"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const dropped = event.dataTransfer.files[0];
        if (dropped) onFile(dropped);
      }}
    >
      <input type="file" accept={accept} className="sr-only" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} />
      <CloudUpload className="h-9 w-9 text-primary" />
      <p className="mt-3 text-sm font-black">{file?.name ?? title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </label>
  );
}

function UploadProgress({ file, progress }: { file?: File; progress: number }) {
  if (!file) return null;

  return (
    <div className="rounded-xl border p-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold">
        <span className="min-w-0 truncate">{file.name}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function imageUrl(campaign: AdCampaign) {
  const record = asRecord(campaign);
  return text(record.imageUrl ?? record.imageURL ?? record.image ?? record.url ?? record.fileUrl, "");
}

function documentUrl(document: LegalDocument) {
  const record = asRecord(document);
  const nestedDocument = asRecord(record.document);
  const nestedFile = asRecord(record.file);
  const nestedPdf = asRecord(record.pdf);
  return text(
    record.fileUrl ??
      record.documentUrl ??
      record.pdfUrl ??
      record.url ??
      record.path ??
      record.location ??
      nestedDocument.fileUrl ??
      nestedDocument.documentUrl ??
      nestedDocument.pdfUrl ??
      nestedDocument.url ??
      nestedDocument.path ??
      nestedFile.fileUrl ??
      nestedFile.url ??
      nestedFile.path ??
      nestedPdf.fileUrl ??
      nestedPdf.url ??
      nestedPdf.path ??
      record.document,
    "",
  );
}

function documentName(document: LegalDocument) {
  const record = asRecord(document);
  const nestedDocument = asRecord(record.document);
  const nestedFile = asRecord(record.file);
  const nestedPdf = asRecord(record.pdf);
  const name = firstText(
    {
      ...nestedPdf,
      ...nestedFile,
      ...nestedDocument,
      ...record,
    },
    ["documentName", "name", "title", "fileName", "originalName", "filename"],
    "",
  );
  if (name) return name;

  const url = documentUrl(document);
  const lastSegment = url.split(/[\\/]/).filter(Boolean).pop();
  return lastSegment ? decodeURIComponent(lastSegment) : "Legal document";
}

function fileType(document: LegalDocument) {
  const record = asRecord(document);
  const nestedDocument = asRecord(record.document);
  const nestedFile = asRecord(record.file);
  const nestedPdf = asRecord(record.pdf);
  const raw = firstText({ ...nestedPdf, ...nestedFile, ...nestedDocument, ...record }, ["fileType", "mimeType", "type", "extension"], "");
  if (!raw) {
    const extension = documentName(document).split(".").pop();
    return extension && extension !== documentName(document) ? extension.toUpperCase() : "-";
  }
  return raw.includes("/") ? raw.split("/").pop()?.toUpperCase() ?? raw : raw.toUpperCase();
}

function uploadedBy(document: LegalDocument) {
  const record = asRecord(document);
  const user = asRecord(record.uploadedBy ?? record.createdBy ?? record.admin);
  return firstText(user, ["fullName", "name", "email"], firstText(record, ["uploadedByName", "adminName"], "-"));
}

function Toolbar({
  placeholder,
  query,
  onQueryChange,
  status,
  onStatusChange,
  primaryLabel,
  onPrimary,
}: {
  placeholder: string;
  query: string;
  onQueryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  primaryLabel: string;
  onPrimary: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card/90 p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(180px,1fr)_170px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder={placeholder} value={query} onChange={(event) => onQueryChange(event.target.value)} />
        </div>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onPrimary} className="shadow-sm">
        <Plus className="h-4 w-4" />
        {primaryLabel}
      </Button>
    </div>
  );
}

function CampaignActions({
  campaign,
  onEdit,
  onToast,
}: {
  campaign: AdCampaign;
  onEdit: (campaign: AdCampaign) => void;
  onToast: (message: string) => void;
}) {
  const toggleStatus = useToggleAdCampaignStatus();
  const deleteCampaign = useDeleteAdCampaign();
  const id = recordId(campaign);

  async function handleToggle() {
    if (!id || !window.confirm("Change this campaign status?")) return;
    try {
      await toggleStatus.mutateAsync(id);
      onToast("Campaign status updated.");
    } catch (error) {
      onToast(getErrorMessage(error, "Unable to update campaign status"));
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm("Delete this ad campaign? This cannot be undone.")) return;
    try {
      await deleteCampaign.mutateAsync(id);
      onToast("Campaign deleted.");
    } catch (error) {
      onToast(getErrorMessage(error, "Unable to delete campaign"));
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open campaign actions" className="h-8 w-8">
          {toggleStatus.isPending || deleteCampaign.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(campaign)}>
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void handleToggle()}>
          <RefreshCw className="h-4 w-4" />
          Toggle status
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void handleDelete()} className="text-red-600 focus:text-red-600">
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CampaignsTab({ onAdd, onEdit, onToast }: { onAdd: () => void; onEdit: (campaign: AdCampaign) => void; onToast: (message: string) => void }) {
  const campaignsQuery = useAdCampaigns();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const campaigns = campaignsQuery.data ?? [];
  const filtered = React.useMemo(() => {
    return campaigns.filter((campaign) => {
      const record = asRecord(campaign);
      const normalizedStatus = activeStatus(record, "Active");
      const haystack = [campaign.title, normalizedStatus, campaign.startDate, campaign.endDate].join(" ").toLowerCase();
      const statusMatch = status === "all" || normalizedStatus.toLowerCase() === status;
      return haystack.includes(query.toLowerCase()) && statusMatch;
    });
  }, [campaigns, query, status]);

  return (
    <div className="space-y-4">
      <Toolbar placeholder="Search campaigns by title, date, status..." query={query} onQueryChange={setQuery} status={status} onStatusChange={setStatus} primaryLabel="Create Campaign" onPrimary={onAdd} />
      <Card className="overflow-hidden rounded-xl shadow-sm">
        <div className="overflow-x-auto sherix-scrollbar">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>{["Image", "Title", "Start Date", "End Date", "Status", "Created Date", "Actions"].map((header) => <th key={header} className="px-5 py-4 text-left font-black">{header}</th>)}</tr>
            </thead>
            {campaignsQuery.isLoading ? (
              <TableLoading columns={7} />
            ) : (
              <tbody className="divide-y">
                {filtered.map((campaign) => {
                  const src = imageUrl(campaign);
                  const statusText = activeStatus(asRecord(campaign), "Active");
                  return (
                    <tr key={recordId(campaign)} className="bg-card transition-colors hover:bg-muted/35">
                      <td className="px-5 py-4">
                        <div className="h-14 w-24 overflow-hidden rounded-lg border bg-muted">
                          {src ? <img src={src} alt={campaign.title ?? "Campaign image"} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground"><ImagePlus className="h-4 w-4" /></div>}
                        </div>
                      </td>
                      <td className="max-w-xs px-5 py-4 font-black">{campaign.title ?? "Untitled campaign"}</td>
                      <td className="px-5 py-4 font-semibold">{dateText(campaign.startDate)}</td>
                      <td className="px-5 py-4 font-semibold">{dateText(campaign.endDate)}</td>
                      <td className="px-5 py-4"><StatusBadge status={statusText} /></td>
                      <td className="px-5 py-4">{dateText(campaign.createdAt)}</td>
                      <td className="px-5 py-4 text-right"><CampaignActions campaign={campaign} onEdit={onEdit} onToast={onToast} /></td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
        {!campaignsQuery.isLoading && filtered.length === 0 && <div className="p-4"><EmptyState title={campaignsQuery.isError ? "Unable to load campaigns" : "No ad campaigns found"} description={campaignsQuery.isError ? "Check the API connection and try again." : "Create a campaign to start scheduling ad placements."} /></div>}
      </Card>
    </div>
  );
}

function CampaignModal({ open, mode, campaign, onClose, onSaved, onError }: { open: boolean; mode: "create" | "edit"; campaign?: AdCampaign; onClose: () => void; onSaved: (message: string) => void; onError: (message: string) => void }) {
  const campaignId = campaign ? recordId(campaign) : "";
  const singleCampaign = useAdCampaign(open && mode === "edit" ? campaignId : undefined);
  const source = singleCampaign.data ?? campaign;
  const createCampaign = useCreateAdCampaign();
  const updateCampaign = useUpdateAdCampaign();
  const [title, setTitle] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [file, setFile] = React.useState<File>();
  const [preview, setPreview] = React.useState("");
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    setTitle(source?.title ?? "");
    setStartDate(source?.startDate ? String(source.startDate).slice(0, 10) : "");
    setEndDate(source?.endDate ? String(source.endDate).slice(0, 10) : "");
    setFile(undefined);
    setPreview(imageUrl(source ?? {}));
    setProgress(0);
  }, [open, source]);

  React.useEffect(() => {
    if (!file) return undefined;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const dateError = startDate && endDate && startDate > endDate ? "End date must be after start date." : undefined;
  const needsImage = mode === "create" && !file;
  const isPending = createCampaign.isPending || updateCampaign.isPending;

  async function submit() {
    if (!title || !startDate || !endDate || dateError || needsImage) return;
    try {
      setProgress(file ? 8 : 100);
      if (mode === "create") {
        await createCampaign.mutateAsync({ payload: { image: file as File, title, startDate, endDate }, onUploadProgress: setProgress });
        onSaved("Campaign created.");
      } else {
        await updateCampaign.mutateAsync({ id: campaignId, payload: { image: file, title, startDate, endDate }, onUploadProgress: setProgress });
        onSaved("Campaign updated.");
      }
      onClose();
    } catch (error) {
      onError(getErrorMessage(error, mode === "create" ? "Unable to create campaign" : "Unable to update campaign"));
    }
  }

  return (
    <ModalShell title={mode === "create" ? "Create Ad Campaign" : "Edit Ad Campaign"} subtitle="Upload the creative and schedule the campaign dates." open={open} onClose={onClose}>
      <div className="grid gap-4 p-5">
        {singleCampaign.isLoading && mode === "edit" ? <div className="rounded-xl border bg-muted/40 p-3 text-sm font-semibold text-muted-foreground">Loading campaign details...</div> : null}
        <FileDropZone file={file} accept="image/*" title={mode === "edit" ? "Drop replacement image or browse" : "Drop image here or browse"} description="PNG, JPG, or WEBP. Recommended 1600 x 900." onFile={setFile} />
        {preview && <img src={preview} alt="Campaign preview" className="h-40 w-full rounded-xl border object-cover" />}
        <UploadProgress file={file} progress={progress} />
        <FormField label="Campaign Title" hint="Required">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Holiday safety check campaign" />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Start Date" hint="Required">
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </FormField>
          <FormField label="End Date" error={dateError} hint="Required">
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </FormField>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t bg-card p-5 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => void submit()} disabled={!title || !startDate || !endDate || needsImage || Boolean(dateError) || isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {mode === "create" ? "Save Campaign" : "Update Campaign"}
        </Button>
      </div>
    </ModalShell>
  );
}

function LegalSummary({ documents }: { documents: LegalDocument[] }) {
  const lastUpdated = documents
    .map((document) => new Date(String(document.updatedAt ?? document.uploadedAt ?? document.createdAt ?? "")).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentCount = documents.filter((document) => {
    const value = new Date(String(document.uploadedAt ?? document.createdAt ?? "")).getTime();
    return Number.isFinite(value) && value >= sevenDaysAgo;
  }).length;
  const metrics = [
    { label: "Total Documents", value: String(documents.length), icon: FileText, tone: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
    { label: "Last Updated", value: lastUpdated ? dateText(new Date(lastUpdated).toISOString()) : "-", icon: CalendarClock, tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
    { label: "Recently Uploaded", value: String(recentCount), icon: Upload, tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className={cn("grid h-10 w-10 place-items-center rounded-xl", metric.tone)}><Icon className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">{metric.label}</p>
                <p className="mt-1.5 text-xl font-black tracking-normal">{metric.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}

function LegalActions({
  document,
  onReplace,
  onToast,
}: {
  document: LegalDocument;
  onReplace: (document: LegalDocument) => void;
  onToast: (message: string) => void;
}) {
  const url = documentUrl(document);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-muted"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild disabled={!url}>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View
            </a>
          ) : (
            <span
              onClick={() =>
                onToast("No document URL was returned by the backend.")
              }
              className="flex items-center gap-2 opacity-50"
            >
              <Eye className="h-4 w-4" />
              View
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem asChild disabled={!url}>
          {url ? (
            <a
              href={url}
              download
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          ) : (
            <span
              onClick={() =>
                onToast("No downloadable URL was returned by the backend.")
              }
              className="flex items-center gap-2 opacity-50"
            >
              <Download className="h-4 w-4" />
              Download
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => onReplace(document)}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Replace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LegalTab({
  onUpload,
  onReplace,
  onToast,
}: {
  onUpload: () => void;
  onReplace: (document?: LegalDocument) => void;
  onToast: (message: string) => void;
}) {
  const legalQuery = useLegalDocuments();
  const documents = legalQuery.data ?? [];
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    return documents.filter((document) =>
      [documentName(document), fileType(document), uploadedBy(document)]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [documents, query]);

  return (
    <div className="space-y-5">
      <LegalSummary documents={documents} />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 h-10"
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Button onClick={onUpload} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">
                  Document
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  File Type
                </th>
                <th className="px-6 py-4 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            {legalQuery.isLoading ? (
              <TableLoading columns={3} />
            ) : (
              <tbody className="divide-y">
                {filtered.map((document) => (
                  <tr
                    key={recordId(document) || documentName(document)}
                    className="hover:bg-muted/40 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                          <FileArchive className="h-5 w-5" />
                        </div>
                        <span className="font-semibold">
                          {documentName(document)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="outline">{fileType(document)}</Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <LegalActions
                        document={document}
                        onReplace={onReplace}
                        onToast={onToast}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {!legalQuery.isLoading && filtered.length === 0 && (
          <div className="p-10 text-center">
            <EmptyState
              title={
                legalQuery.isError
                  ? "Unable to load documents"
                  : "No documents found"
              }
              description={
                legalQuery.isError
                  ? "GET /legal/pdf failed to return data."
                  : "Upload a document to get started."
              }
            />

            {!legalQuery.isError && (
              <div className="mt-5">
                <Button onClick={onUpload} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function LegalDocumentModal({ open, mode, selectedDocument, documents, onClose, onSaved, onError }: { open: boolean; mode: "upload" | "replace"; selectedDocument?: LegalDocument; documents: LegalDocument[]; onClose: () => void; onSaved: (message: string) => void; onError: (message: string) => void }) {
  const uploadDocument = useUploadLegalDocument();
  const [documentId, setDocumentId] = React.useState("");
  const [file, setFile] = React.useState<File>();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    setDocumentId(selectedDocument ? recordId(selectedDocument) : "");
    setFile(undefined);
    setProgress(0);
  }, [open, selectedDocument]);

  const allowed = [".pdf", ".doc", ".docx", ".txt"];
  const fileError = file && !allowed.some((extension) => file.name.toLowerCase().endsWith(extension)) ? "Supported files: PDF, DOC, DOCX, TXT." : undefined;

  async function submit() {
    if (!file || fileError || (mode === "replace" && !documentId)) return;
    try {
      setProgress(8);
      await uploadDocument.mutateAsync({ document: file, onUploadProgress: setProgress });
      onSaved(mode === "replace" ? "Document updated." : "Document uploaded.");
      onClose();
    } catch (error) {
      onError(getErrorMessage(error, "Unable to upload legal document"));
    }
  }

  return (
    <ModalShell title={mode === "replace" ? "Update Legal Document" : "Upload Legal Document"} subtitle="Upload a new legal document or replace an existing one." open={open} onClose={onClose}>
      <div className="grid gap-4 p-5">
        {mode === "replace" && (
          <FormField label="Existing Document" hint="Selecting a document helps identify what you are updating; the backend upsert endpoint is PUT /admin/legal.">
            <Select value={documentId} onValueChange={setDocumentId}>
              <SelectTrigger><SelectValue placeholder="Select document" /></SelectTrigger>
              <SelectContent className="bg-white">
                {documents.map((document) => <SelectItem key={recordId(document) || documentName(document)} value={recordId(document) || documentName(document)}>{documentName(document)}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
        )}
        <FileDropZone file={file} accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" title="Drop document here or browse" description="Supported file types: PDF, DOC, DOCX, TXT." onFile={setFile} />
        <UploadProgress file={file} progress={progress} />
        {fileError && <p className="text-xs font-bold text-red-600">{fileError}</p>}
      </div>
      <div className="flex flex-col-reverse gap-2 border-t bg-card p-5 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => void submit()} disabled={!file || Boolean(fileError) || uploadDocument.isPending || (mode === "replace" && !documentId)}>
          {uploadDocument.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {mode === "replace" ? "Update Document" : "Upload Document"}
        </Button>
      </div>
    </ModalShell>
  );
}

export function OrganizationDataDashboard() {
  const [modal, setModal] = React.useState<ModalType>(null);
  const [toast, setToast] = React.useState("");
  const [selectedCampaign, setSelectedCampaign] = React.useState<AdCampaign>();
  const [selectedDocument, setSelectedDocument] = React.useState<LegalDocument>();
  const legalQuery = useLegalDocuments();
  const showToast = React.useCallback((message: string) => setToast(message), []);

  function openCampaignEdit(campaign: AdCampaign) {
    setSelectedCampaign(campaign);
    setModal("campaign-edit");
  }

  function openLegalReplace(document?: LegalDocument) {
    setSelectedDocument(document);
    setModal("legal-replace");
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <PageHeader title="Organization Data" subtitle="Manage campaign assets and legal documentation." />

      <Tabs defaultValue="campaigns" className="space-y-5">
        <div className="overflow-x-auto sherix-scrollbar">
          <TabsList className="h-auto min-w-max justify-start rounded-xl border bg-card p-1 shadow-sm">
            <TabsTrigger value="campaigns" className="gap-2 px-4 py-2"><ImagePlus className="h-4 w-4" />Ads/Campaigns</TabsTrigger>
            <TabsTrigger value="legal" className="gap-2 px-4 py-2"><Gavel className="h-4 w-4" />Legal</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="campaigns"><CampaignsTab onAdd={() => setModal("campaign-create")} onEdit={openCampaignEdit} onToast={showToast} /></TabsContent>
        <TabsContent value="legal"><LegalTab onUpload={() => setModal("legal-upload")} onReplace={openLegalReplace} onToast={showToast} /></TabsContent>
      </Tabs>

      <CampaignModal open={modal === "campaign-create"} mode="create" onClose={() => setModal(null)} onSaved={showToast} onError={showToast} />
      <CampaignModal open={modal === "campaign-edit"} mode="edit" campaign={selectedCampaign} onClose={() => setModal(null)} onSaved={showToast} onError={showToast} />
      <LegalDocumentModal open={modal === "legal-upload"} mode="upload" documents={legalQuery.data ?? []} onClose={() => setModal(null)} onSaved={showToast} onError={showToast} />
      <LegalDocumentModal open={modal === "legal-replace"} mode="replace" selectedDocument={selectedDocument} documents={legalQuery.data ?? []} onClose={() => setModal(null)} onSaved={showToast} onError={showToast} />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
