"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const STEP_MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

type TimePickerProps = {
  /** "HH:mm" (24-hour) or "" when unset. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Accessible label prefix, e.g. "Monday open time". */
  label?: string;
  className?: string;
};

/**
 * Brand-styled 24-hour time picker built from shadcn `Select`s. Replaces the
 * native `<input type="time">` (which renders the unstyled OS widget). Minutes
 * step by 5, but any pre-existing off-step value stays selectable.
 */
export function TimePicker({
  value,
  onChange,
  disabled,
  label,
  className,
}: TimePickerProps) {
  const [hour, minute] = value ? value.split(":") : ["", ""];

  const minutes = React.useMemo(() => {
    if (minute && !STEP_MINUTES.includes(minute)) {
      return [...STEP_MINUTES, minute].sort();
    }
    return STEP_MINUTES;
  }, [minute]);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Select
        value={hour}
        onValueChange={(h) => onChange(`${h}:${minute || "00"}`)}
        disabled={disabled}
      >
        <SelectTrigger
          className="w-[4.25rem]"
          aria-label={label ? `${label} hour` : "Hour"}
        >
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground text-sm">:</span>
      <Select
        value={minute}
        onValueChange={(m) => onChange(`${hour || "00"}:${m}`)}
        disabled={disabled}
      >
        <SelectTrigger
          className="w-[4.25rem]"
          aria-label={label ? `${label} minute` : "Minute"}
        >
          <SelectValue placeholder="mm" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
