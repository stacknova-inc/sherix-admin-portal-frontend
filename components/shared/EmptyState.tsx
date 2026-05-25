import { Inbox } from "lucide-react";

export function EmptyState({ title = "No records yet", description = "Data will appear here when it is available." }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed bg-card p-8 text-center">
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground" />
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
