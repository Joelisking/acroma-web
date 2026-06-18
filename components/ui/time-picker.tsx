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

// Displayed hours run 12, 1, 2, ... 11 (12-hour clock); the value stays "HH:mm"
// 24-hour internally.
const HOURS_12 = [12, ...Array.from({ length: 11 }, (_, i) => i + 1)].map(
  String,
);
const STEP_MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);
const PERIODS = ["AM", "PM"] as const;
type Period = (typeof PERIODS)[number];

/** Convert a 12-hour clock value + AM/PM into a 0-23 hour. */
function to24Hour(hour12: number, period: Period): number {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

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
 * Brand-styled 12-hour (AM/PM) time picker built from shadcn `Select`s.
 * Replaces the native `<input type="time">` (which renders the unstyled OS
 * widget). The value it emits and accepts stays "HH:mm" 24-hour so callers and
 * the API contract are unaffected; only the display is 12-hour. Minutes step by
 * 5, but any pre-existing off-step value stays selectable.
 */
export function TimePicker({
  value,
  onChange,
  disabled,
  label,
  className,
}: TimePickerProps) {
  const [hhStr, minute] = value ? value.split(":") : ["", ""];
  const hour24 = hhStr === "" ? null : Number(hhStr);
  const period: Period | "" = hour24 === null ? "" : hour24 < 12 ? "AM" : "PM";
  const hour12 =
    hour24 === null ? "" : String(hour24 % 12 === 0 ? 12 : hour24 % 12);

  const minutes = React.useMemo(() => {
    if (minute && !STEP_MINUTES.includes(minute)) {
      return [...STEP_MINUTES, minute].sort();
    }
    return STEP_MINUTES;
  }, [minute]);

  function emit(h24: number, m: string) {
    onChange(`${String(h24).padStart(2, "0")}:${m}`);
  }

  function handleHour(h12: string) {
    emit(to24Hour(Number(h12), period || "AM"), minute || "00");
  }

  function handlePeriod(p: Period) {
    emit(to24Hour(hour12 === "" ? 12 : Number(hour12), p), minute || "00");
  }

  function handleMinute(m: string) {
    emit(hour24 ?? 0, m);
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Select value={hour12} onValueChange={handleHour} disabled={disabled}>
        <SelectTrigger
          className="w-[4.25rem]"
          aria-label={label ? `${label} hour` : "Hour"}
        >
          <SelectValue placeholder="12" />
        </SelectTrigger>
        <SelectContent>
          {HOURS_12.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground text-sm">:</span>
      <Select value={minute} onValueChange={handleMinute} disabled={disabled}>
        <SelectTrigger
          className="w-[4.25rem]"
          aria-label={label ? `${label} minute` : "Minute"}
        >
          <SelectValue placeholder="00" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={handlePeriod} disabled={disabled}>
        <SelectTrigger
          className="w-[4.5rem]"
          aria-label={label ? `${label} AM or PM` : "AM or PM"}
        >
          <SelectValue placeholder="AM" />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
