import { PageHeader } from "@/components/shared/PageHeader";
import { CardShell } from "@/components/shared/CardShell";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-5">
      <PageHeader title={title} subtitle={`${title} tools will be connected in a later build phase.`} />
      <CardShell className="p-5">
        <p className="text-sm font-semibold text-muted-foreground">{title} page coming soon</p>
      </CardShell>
    </div>
  );
}
