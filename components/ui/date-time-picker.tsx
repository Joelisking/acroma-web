"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDateStr(s: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

type DateTimePickerProps = {
  /** "YYYY-MM-DDTHH:mm" (datetime-local shape) or "" when unset. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
};

/**
 * Brand-styled date + time picker: a shadcn `Calendar` in a `Popover` for the
 * date plus the `TimePicker` for the time. Replaces the native
 * `<input type="datetime-local">`. Value is the same "YYYY-MM-DDTHH:mm" string
 * the native input produced, so callers are unchanged.
 */
export function DateTimePicker({
  value,
  onChange,
  disabled,
  id,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [datePart, timePart] = value ? value.split("T") : ["", ""];
  const date = parseDateStr(datePart);

  function setDate(next: Date | undefined) {
    if (!next) {
      onChange("");
      return;
    }
    onChange(`${toDateStr(next)}T${timePart || "00:00"}`);
    setOpen(false);
  }

  function setTime(time: string) {
    const day = datePart || toDateStr(new Date());
    onChange(`${day}T${time}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-[10rem] justify-start gap-2 font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-4" strokeWidth={1.75} />
            {date ? format(date, "d MMM yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
      <TimePicker
        value={timePart}
        onChange={setTime}
        disabled={disabled}
        label="Time"
      />
    </div>
  );
}
