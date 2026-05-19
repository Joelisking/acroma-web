"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  startDate?: string;
  endDate?: string;
  onApply: (startDate: string, endDate: string) => void;
};

/** Format a Date as a UTC YYYY-MM-DD string. */
function toIsoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function parseIsoDate(s?: string): Date | undefined {
  if (!s) return undefined;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function CustomRangePicker({ startDate, endDate, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>({
    from: parseIsoDate(startDate),
    to: parseIsoDate(endDate),
  });

  const triggerLabel =
    startDate && endDate ? `${startDate} → ${endDate}` : "Pick dates";

  function apply() {
    if (range?.from && range?.to) {
      onApply(toIsoDate(range.from), toIsoDate(range.to));
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarDays className="size-3.5 opacity-60" />
          <span className="truncate">{triggerLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={1}
          autoFocus
        />
        <div className="flex justify-end gap-2 border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!range?.from || !range?.to}
            onClick={apply}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
