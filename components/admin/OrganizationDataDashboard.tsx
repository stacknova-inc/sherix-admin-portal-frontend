"use client";

import * as React from "react";
import {
  AlignLeft,
  BadgeCheck,
  Bold,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CloudUpload,
  DollarSign,
  Eye,
  FileClock,
  FileText,
  Filter,
  Gavel,
  GripVertical,
  Heading1,
  ImagePlus,
  Italic,
  LayoutGrid,
  Link2,
  List,
  ListOrdered,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Redo2,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
  Trash2,
  Underline,
  Undo2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";

type ModalType = "service" | "issue" | "campaign" | null;

const services = [
  {
    title: "Roadside Assistance",
    description: "On-demand emergency support for towing, jump starts, lockouts, and urgent roadside requests.",
    created: "May 18, 2026",
    status: "Active",
  },
  {
    title: "Vehicle Diagnostics",
    description: "Structured diagnostic service for fault detection, inspection notes, and provider recommendations.",
    created: "May 14, 2026",
    status: "Active",
  },
  {
    title: "Fleet Maintenance",
    description: "Recurring maintenance plans for business accounts with audit-ready service documentation.",
    created: "Apr 29, 2026",
    status: "Draft",
  },
];

const issues = [
  {
    title: "Emergency Towing Request",
    description: "Escalated towing case submitted by an enterprise fleet customer.",
    min: "GHS 180",
    max: "GHS 450",
    created: "May 20, 2026",
    status: "Open",
  },
  {
    title: "Battery Replacement Review",
    description: "Price review for replacement battery requests in high-demand regions.",
    min: "GHS 250",
    max: "GHS 680",
    created: "May 17, 2026",
    status: "In Review",
  },
  {
    title: "Provider Compliance Exception",
    description: "Temporary service exception requiring operations and compliance approval.",
    min: "GHS 90",
    max: "GHS 220",
    created: "May 11, 2026",
    status: "Open",
  },
];

const campaigns = [
  {
    title: "Safety Check Campaign",
    uploaded: "May 22, 2026 09:42",
    timeframe: "May 24, 2026 08:00 - Jun 02, 2026 23:59",
    status: "Live",
    image: "from-rose-500 via-orange-400 to-amber-300",
  },
  {
    title: "Premium Fleet Support",
    uploaded: "May 18, 2026 15:16",
    timeframe: "May 27, 2026 10:00 - Jun 12, 2026 18:00",
    status: "Scheduled",
    image: "from-sky-500 via-cyan-400 to-emerald-300",
  },
  {
    title: "Weekend Rescue Promo",
    uploaded: "May 13, 2026 12:03",
    timeframe: "May 15, 2026 06:00 - May 20, 2026 22:00",
    status: "Draft",
    image: "from-slate-800 via-indigo-500 to-fuchsia-400",
  },
];

const versions = [
  { version: "v4.2", label: "Current policy", time: "Today, 10:38" },
  { version: "v4.1", label: "Compliance note added", time: "May 18, 2026" },
  { version: "v4.0", label: "Regional terms revised", time: "May 08, 2026" },
];

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/15 dark:text-emerald-300",
  Draft: "bg-slate-100 text-slate-700 ring-slate-600/15 dark:bg-slate-500/15 dark:text-slate-300",
  Open: "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/15 dark:text-amber-300",
  "In Review": "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-500/15 dark:text-blue-300",
  Live: "bg-red-50 text-primary ring-primary/15 dark:bg-red-500/15 dark:text-red-300",
  Scheduled: "bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/15 dark:text-violet-300",
};



function StatusBadge({ status }: { status: string }) {
  return <Badge className={cn("ring-1", statusStyles[status] ?? statusStyles.Draft)}>{status}</Badge>;
}

function ActionMenu({ onAction }: { onAction: (message: string) => void }) {
  function requestDelete() {
    if (window.confirm("Delete this record? This action can be reviewed in audit logs.")) {
      onAction("Record deleted and audit log updated.");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open row actions" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onAction("Record opened in detail view.")}>
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onAction("Edit mode opened.")}>
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={requestDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Toolbar({
  placeholder,
  primaryLabel,
  onPrimary,
}: {
  placeholder: string;
  primaryLabel: string;
  onPrimary: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card/90 p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(180px,1fr)_160px_150px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder={placeholder} />
        </div>
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">In review</SelectItem>
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

function ModalShell({
  title,
  subtitle,
  open,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm animate-in fade-in-0">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-background shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4">
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

function ServicesTab({ onAdd, onAction }: { onAdd: () => void; onAction: (message: string) => void }) {
  return (
    <div className="space-y-4">
      <Toolbar placeholder="Search services by title, owner, status..." primaryLabel="Add Services" onPrimary={onAdd} />
      <Card className="overflow-hidden rounded-xl shadow-sm">
        <div className="overflow-x-auto sherix-scrollbar">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {["Service", "Description", "Created Date", "Status", "Actions"].map((header) => (
                  <th key={header} className="px-5 py-4 text-left font-black">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {services.map((service) => (
                <tr key={service.title} className="group bg-card transition-colors hover:bg-muted/35">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <BadgeCheck className="h-5 w-5" />
                      </span>
                      <span className="font-black">{service.title}</span>
                    </div>
                  </td>
                  <td className="max-w-md px-5 py-4 text-muted-foreground">{service.description}</td>
                  <td className="px-5 py-4 font-semibold">{service.created}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={service.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ActionMenu onAction={onAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination label="Showing 1-3 of 24 services" />
      </Card>
    </div>
  );
}

function IssuesTab({ onAdd, onAction }: { onAdd: () => void; onAction: (message: string) => void }) {
  return (
    <div className="space-y-4">
      <Toolbar placeholder="Search issues, requests, price bands..." primaryLabel="Add Issue" onPrimary={onAdd} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="overflow-hidden rounded-xl shadow-sm">
          <div className="overflow-x-auto sherix-scrollbar">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  {["Issue", "Description", "Minimum", "Maximum", "Date Created", "Status", "Actions"].map((header) => (
                    <th key={header} className="px-5 py-4 text-left font-black">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {issues.map((issue) => (
                  <tr key={issue.title} className="bg-card transition-colors hover:bg-muted/35">
                    <td className="px-5 py-4 font-black">{issue.title}</td>
                    <td className="max-w-sm px-5 py-4 text-muted-foreground">{issue.description}</td>
                    <td className="px-5 py-4 font-bold">{issue.min}</td>
                    <td className="px-5 py-4 font-bold">{issue.max}</td>
                    <td className="px-5 py-4">{issue.created}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ActionMenu  onAction={onAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination label="Showing 1-3 of 17 issues" />
        </Card>
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-black">Resolution Queue</p>
            <div className="mt-4 space-y-3">
              {["Pricing approval", "Provider response", "Legal review"].map((item, index) => (
                <div key={item} className="flex items-center justify-between rounded-lg bg-muted/45 p-3">
                  <span className="text-xs font-bold">{item}</span>
                  <Badge variant="outline">{index + 2}</Badge>
                </div>
              ))}
            </div>
          </div>
         
        </div>
      </div>
    </div>
  );
}

function CampaignsTab({ onAdd, onAction }: { onAdd: () => void; onAction: (message: string) => void }) {
  function requestDelete() {
    if (window.confirm("Delete this campaign image? Published placements will stop using it.")) {
      onAction("Campaign image deleted.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card/90 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        
        <Button onClick={onAdd}>
          <ImagePlus className="h-4 w-4" />
          Add Image
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <Card key={campaign.title} className="group overflow-hidden rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className={cn("relative aspect-[16/10] bg-gradient-to-br", campaign.image)}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.45),transparent_28%),linear-gradient(135deg,rgba(0,0,0,.05),rgba(0,0,0,.24))]" />
              <div className="absolute left-4 top-4">
                <StatusBadge status={campaign.status} />
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-lg font-black tracking-normal drop-shadow">{campaign.title}</p>
                <p className="mt-1 text-xs font-semibold opacity-90">{campaign.timeframe}</p>
              </div>
            </div>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CloudUpload className="h-4 w-4" />
                  Uploaded {campaign.uploaded}
                </span>
                <GripVertical className="h-4 w-4 opacity-40" />
              </div>
              <div className="flex gap-2">
                <Button variant={campaign.status === "Live" ? "secondary" : "default"} className="flex-1" onClick={() => onAction(campaign.status === "Live" ? "Campaign is already live." : "Campaign published successfully.")}>
                  <Sparkles className="h-4 w-4" />
                  Publish
                </Button>
                <Button variant="outline" size="icon" aria-label="Delete campaign" onClick={requestDelete}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LegalTab() {
  const [preview, setPreview] = React.useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);

  function focusEditor() {
    editorRef.current?.focus();
  }

  function runCommand(command: string, value?: string) {
    focusEditor();
    document.execCommand(command, false, value);
  }

  function addHeading() {
    runCommand("formatBlock", "h2");
  }

  function addLink() {
    const url = window.prompt("Enter link URL");
    if (!url) return;
    runCommand("createLink", url);
  }

  function addTable() {
    focusEditor();
    document.execCommand(
      "insertHTML",
      false,
      '<table style="width:100%;border-collapse:collapse;margin:16px 0"><tbody><tr><th style="border:1px solid #d1d5db;padding:8px;text-align:left">Requirement</th><th style="border:1px solid #d1d5db;padding:8px;text-align:left">Owner</th><th style="border:1px solid #d1d5db;padding:8px;text-align:left">Status</th></tr><tr><td style="border:1px solid #d1d5db;padding:8px">Policy review</td><td style="border:1px solid #d1d5db;padding:8px">Legal Ops</td><td style="border:1px solid #d1d5db;padding:8px">In review</td></tr></tbody></table>',
    );
  }

  const toolbarActions = [
    { icon: Undo2, label: "Undo", action: () => runCommand("undo") },
    { icon: Redo2, label: "Redo", action: () => runCommand("redo") },
    { icon: Bold, label: "Bold", action: () => runCommand("bold") },
    { icon: Italic, label: "Italic", action: () => runCommand("italic") },
    { icon: Underline, label: "Underline", action: () => runCommand("underline") },
    { icon: Heading1, label: "Header", action: addHeading },
    { icon: List, label: "Bullets", action: () => runCommand("insertUnorderedList") },
    { icon: ListOrdered, label: "Numbers", action: () => runCommand("insertOrderedList") },
    { icon: Link2, label: "Link", action: addLink },
    { icon: Table2, label: "Table", action: addTable },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="overflow-hidden rounded-xl shadow-sm">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b bg-card/95 p-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-1.5">
            {toolbarActions.map(({ icon: Icon, label, action }) => (
              <Button key={label} type="button" variant="ghost" size="icon" aria-label={label} title={label} className="h-8 w-8" onMouseDown={(event) => event.preventDefault()} onClick={action} disabled={preview}>
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:flex dark:bg-emerald-500/15 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Auto-saved
            </span>
            <Button variant="outline" onClick={() => setPreview((value) => !value)}>
              <Eye className="h-4 w-4" />
              {preview ? "Edit" : "Preview"}
            </Button>
            <Button>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
        <div className="min-h-[560px] bg-card p-5 sm:p-8">
          {preview ? (
            <article className="mx-auto max-w-3xl space-y-5 rounded-xl border bg-background p-6 shadow-sm">
              <Badge variant="outline">Preview mode</Badge>
              <h2 className="text-2xl font-black tracking-normal">Organizational Legal Policy</h2>
              <p className="leading-7 text-muted-foreground">
                Sherix maintains operational, compliance, and advertising policies for all active markets. This policy defines provider requirements, campaign standards, customer protections, and governance controls.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>All service categories require documented operational ownership.</li>
                <li>Published campaigns must include a valid start and end timeframe.</li>
                <li>Issue pricing bands must be reviewed before publication.</li>
              </ul>
            </article>
          ) : (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="prose prose-sm mx-auto min-h-[500px] max-w-3xl rounded-xl border bg-background p-6 text-sm leading-7 shadow-sm outline-none transition focus:ring-2 focus:ring-ring dark:prose-invert prose-headings:tracking-normal prose-a:text-primary prose-table:w-full prose-th:border prose-th:p-2 prose-th:text-left prose-td:border prose-td:p-2"
            >
              <h2 className="mb-4 text-2xl font-black tracking-normal">Organizational Legal Policy</h2>
              <p className="mb-4 text-muted-foreground">
                Sherix maintains operational, compliance, and advertising policies for all active markets. Use this workspace to update policy language, compliance notes, and organization-wide legal content.
              </p>
              <h3 className="mb-2 text-base font-black">Compliance Notes</h3>
              <p className="text-muted-foreground">
                Provider onboarding, campaign approvals, and issue price bands must be reviewed against current governance standards before publication.
              </p>
            </div>
          )}
        </div>
      </Card>
      
    </div>
  );
}

function Pagination({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3 border-t p-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>{label}</span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {[1, 2, 3].map((page) => (
          <Button key={page} variant={page === 1 ? "default" : "ghost"} size="icon" className="h-8 w-8">
            {page}
          </Button>
        ))}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function FormField({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      <span>{label}</span>
      {children}
      <span className={cn("text-xs", error ? "text-red-600" : "text-muted-foreground")}>{error ?? hint}</span>
    </label>
  );
}

function ServiceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const titleError = title.length > 0 && title.length < 4 ? "Use at least 4 characters." : undefined;
  const descriptionError = description.length > 180 ? "Description must be 180 characters or fewer." : undefined;

  return (
    <ModalShell title="Add Services" subtitle="Create a managed service that admins can track and publish." open={open} onClose={onClose}>
      <div className="grid gap-4 p-5">
        <FormField label="Service Title" error={titleError} hint={`${title.length}/80 characters`}>
          <Input value={title} onChange={(event) => setTitle(event.target.value.slice(0, 80))} placeholder="Fleet maintenance" />
        </FormField>
        <FormField label="Service Description" error={descriptionError} hint={`${description.length}/180 characters`}>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value.slice(0, 200))}
            className="min-h-28 rounded-lg border bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Describe what this service includes..."
          />
        </FormField>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t bg-card p-5 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button disabled={!title || !description || Boolean(titleError || descriptionError)}>Save Service</Button>
      </div>
    </ModalShell>
  );
}

function IssueModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [min, setMin] = React.useState("100");
  const [max, setMax] = React.useState("500");
  const minValue = Number(min);
  const maxValue = Number(max);
  const priceError = minValue > 0 && maxValue > 0 && minValue >= maxValue ? "Maximum price must be greater than minimum price." : undefined;

  return (
    <ModalShell title="Add Issue" subtitle="Define the issue, expected price range, and review details." open={open} onClose={onClose}>
      <div className="grid gap-4 p-5">
        <FormField label="Issue Title" hint="Keep it short and operationally clear.">
          <Input placeholder="Emergency towing price exception" />
        </FormField>
        <FormField label="Issue Description" hint="Add enough context for reviewers.">
          <textarea className="min-h-24 rounded-lg border bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring" placeholder="Describe the request or issue..." />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Minimum Price" error={priceError}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">GHS</span>
              <Input value={min} onChange={(event) => setMin(event.target.value.replace(/[^\d.]/g, ""))} className="pl-12" inputMode="decimal" />
            </div>
          </FormField>
          <FormField label="Maximum Price" error={priceError}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">GHS</span>
              <Input value={max} onChange={(event) => setMax(event.target.value.replace(/[^\d.]/g, ""))} className="pl-12" inputMode="decimal" />
            </div>
          </FormField>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t bg-card p-5 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button disabled={Boolean(priceError) || !min || !max}>Save Issue</Button>
      </div>
    </ModalShell>
  );
}

function CampaignModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fileName, setFileName] = React.useState("");
  const [progress, setProgress] = React.useState(0);

  function handleFile(file?: File) {
    if (!file) return;
    setFileName(file.name);
    setProgress(22);
    window.setTimeout(() => setProgress(68), 350);
    window.setTimeout(() => setProgress(100), 850);
  }

  return (
    <ModalShell title="Add Campaign Image" subtitle="Upload a campaign creative and schedule its active timeframe." open={open} onClose={onClose}>
      <div className="grid gap-4 p-5">
        <label
          className="grid cursor-pointer place-items-center rounded-xl border border-dashed bg-muted/35 p-8 text-center transition hover:border-primary hover:bg-primary/5"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFile(event.dataTransfer.files[0]);
          }}
        >
          <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} />
          <CloudUpload className="h-9 w-9 text-primary" />
          <p className="mt-3 text-sm font-black">{fileName || "Drop image here or browse"}</p>
          <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, or WEBP. Recommended 1600 x 900.</p>
        </label>
        {fileName && (
          <div className="rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span>{fileName}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <FormField label="Campaign Title" hint="Optional, but recommended for campaign reporting.">
          <Input placeholder="Holiday safety check campaign" />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Start Date & Time">
            <Input type="datetime-local" />
          </FormField>
          <FormField label="End Date & Time">
            <Input type="datetime-local" />
          </FormField>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t bg-card p-5 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button disabled={!fileName || progress < 100}>
          {fileName && progress < 100 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          Save Campaign
        </Button>
      </div>
    </ModalShell>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border bg-card p-4 text-sm font-bold shadow-2xl animate-in slide-in-from-bottom-4">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">{message}</span>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label="Dismiss notification">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function OrganizationDataDashboard() {
  const [modal, setModal] = React.useState<ModalType>(null);
  const [toast, setToast] = React.useState("");
  const showToast = React.useCallback((message: string) => setToast(message), []);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader title="Organization Data" subtitle="Manage services, issue workflows, campaign assets, and legal documentation." />
        
      </div>

      

      <Tabs defaultValue="services" className="space-y-5">
        <div className="overflow-x-auto sherix-scrollbar">
          <TabsList className="h-auto min-w-max justify-start rounded-xl border bg-card p-1 shadow-sm">
            <TabsTrigger value="services" className="gap-2 px-4 py-2">
              <BadgeCheck className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-2 px-4 py-2">
              <AlignLeft className="h-4 w-4" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2 px-4 py-2">
              <ImagePlus className="h-4 w-4" />
              Ads/Campaigns
            </TabsTrigger>
            <TabsTrigger value="legal" className="gap-2 px-4 py-2">
              <Gavel className="h-4 w-4" />
              Legal
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="services">
          <ServicesTab onAdd={() => setModal("service")} onAction={showToast} />
        </TabsContent>
        <TabsContent value="issues">
          <IssuesTab onAdd={() => setModal("issue")} onAction={showToast} />
        </TabsContent>
        <TabsContent value="campaigns">
          <CampaignsTab onAdd={() => setModal("campaign")} onAction={showToast} />
        </TabsContent>
        <TabsContent value="legal">
          <LegalTab />
        </TabsContent>
      </Tabs>

      <ServiceModal open={modal === "service"} onClose={() => setModal(null)} />
      <IssueModal open={modal === "issue"} onClose={() => setModal(null)} />
      <CampaignModal open={modal === "campaign"} onClose={() => setModal(null)} />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
