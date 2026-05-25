export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-xl font-black tracking-normal text-foreground sm:text-2xl">{title}</h1>
      {subtitle && <p className="mt-1.5 max-w-3xl text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
    </div>
  );
}
