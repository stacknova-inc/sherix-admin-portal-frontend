import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DateRangePickerButton() {
  return (
    <Button variant="outline" className="hidden bg-card text-xs font-semibold sm:inline-flex" aria-label="Selected date range">
      <CalendarDays className="h-3.5 w-3.5 text-primary" />
      May 12 - May 18, 2025
    </Button>
  );
}
