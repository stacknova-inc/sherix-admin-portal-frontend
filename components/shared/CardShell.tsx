import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CardShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return <Card className={cn("overflow-hidden border-border/80 bg-card shadow-sm", className)}>{children}</Card>;
}
