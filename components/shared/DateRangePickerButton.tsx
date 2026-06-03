"use client";

import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DateRangePickerButton() {
  const today = new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });

  return (
    <Button variant="outline" className="hidden bg-card text-xs font-semibold sm:inline-flex" aria-label="Current date">
      <CalendarDays className="h-3.5 w-3.5 text-primary" />
      {today}
    </Button>
  );
}
