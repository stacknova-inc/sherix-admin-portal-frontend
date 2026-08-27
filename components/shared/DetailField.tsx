import type { ReactNode } from "react";

export function DetailGrid({ fields }: { fields: Array<[string, ReactNode]> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([label, value]) => (
        <div key={label} className="rounded-xl border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="mt-2 break-words font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}
