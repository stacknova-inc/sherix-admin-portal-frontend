import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ProviderDetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-black uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="divide-y rounded-lg border">{children}</div>
    </section>
  );
}

export function ProviderDetailRow({ label, value }: { label: string; value: ReactNode }) {
  const isEmpty = value === null || value === undefined || value === "";
  return (
    <div className="flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className={cn("break-words text-sm font-bold sm:text-right", isEmpty && "font-medium text-muted-foreground")}>
        {isEmpty ? "Not available" : value}
      </span>
    </div>
  );
}

export function ProviderDetailEmpty({ message }: { message: string }) {
  return <p className="px-4 py-3 text-sm font-semibold text-muted-foreground">{message}</p>;
}
