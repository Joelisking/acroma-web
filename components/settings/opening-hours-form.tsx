"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  clearOpeningHoursAction,
  updateOpeningHoursAction,
} from "@/lib/api/settings-actions";
import { isOpen, nextOpenTime, formatNextOpen, toMinutes } from "@/lib/business-hours";
import type { DayHours, OpeningHours } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const DEFAULT_HOURS: DayHours = { open: "09:00", close: "22:00" };

const EMPTY_WEEK: OpeningHours = {
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
  sunday: null,
};


type Props = {
  initial: OpeningHours | null;
};

export function OpeningHoursForm({ initial }: Props) {
  const [hours, setHours] = React.useState<OpeningHours>(
    initial ?? EMPTY_WEEK,
  );
  const [pending, startTransition] = React.useTransition();

  const errors = React.useMemo(() => {
    const e: Partial<Record<DayKey, string>> = {};
    for (const { key } of DAYS) {
      const d = hours[key];
      if (d && toMinutes(d.close) <= toMinutes(d.open)) {
        e[key] = "Close must be after open";
      }
    }
    return e;
  }, [hours]);

  const hasErrors = Object.keys(errors).length > 0;

  const allDaysClosed = React.useMemo(
    () => DAYS.every(({ key }) => hours[key] === null),
    [hours],
  );

  const statusLine = React.useMemo(() => {
    if (initial === null && allDaysClosed) {
      return "Currently: always open. Add hours below to start auto-replying when closed.";
    }
    const now = new Date();
    if (isOpen(hours, now)) {
      return "Currently: open.";
    }
    const friendly = formatNextOpen(now, nextOpenTime(hours, now));
    return `Currently: closed. Opens ${friendly}.`;
  }, [hours, initial, allDaysClosed]);

  function setDay(key: DayKey, value: DayHours | null) {
    setHours((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDay(key: DayKey, on: boolean) {
    setDay(key, on ? DEFAULT_HOURS : null);
  }

  function setOpen(key: DayKey, open: string) {
    const current = hours[key] ?? DEFAULT_HOURS;
    setDay(key, { ...current, open });
  }

  function setClose(key: DayKey, close: string) {
    const current = hours[key] ?? DEFAULT_HOURS;
    setDay(key, { ...current, close });
  }

  function onSave() {
    if (hasErrors) return;
    startTransition(async () => {
      const result = await updateOpeningHoursAction(hours);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Opening hours saved");
      }
    });
  }

  function onAlwaysOpen() {
    startTransition(async () => {
      const result = await clearOpeningHoursAction();
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Set to always open");
        setHours(EMPTY_WEEK);
      }
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">{statusLine}</p>

      <div className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const day = hours[key];
          const enabled = day !== null;
          const dayError = errors[key];
          return (
            <div
              key={key}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-card p-3",
                dayError && "border-destructive",
              )}
            >
              <div className="flex w-32 items-center gap-3">
                <Switch
                  id={`day-${key}`}
                  checked={enabled}
                  onCheckedChange={(on) => toggleDay(key, on)}
                  disabled={pending}
                />
                <Label htmlFor={`day-${key}`} className="text-sm font-medium">
                  {label}
                </Label>
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Input
                  type="time"
                  aria-label={`${label} open time`}
                  value={day?.open ?? ""}
                  onChange={(e) => setOpen(key, e.target.value)}
                  disabled={!enabled || pending}
                  className="w-32"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  type="time"
                  aria-label={`${label} close time`}
                  value={day?.close ?? ""}
                  onChange={(e) => setClose(key, e.target.value)}
                  disabled={!enabled || pending}
                  className="w-32"
                />
              </div>
              {dayError ? (
                <p className="text-destructive w-full text-xs">{dayError}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending || initial === null}
          onClick={onAlwaysOpen}
        >
          Always open
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={pending || hasErrors}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
