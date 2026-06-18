"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { Button } from "@/components/ui/button";
import {
  clearOpeningHoursAction,
  updateOpeningHoursAction,
} from "@/lib/api/settings-actions";
import { isOvernight, toMinutes } from "@/lib/business-hours";
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

export function OnboardingOpeningHoursStep({ initial }: Props) {
  const router = useRouter();
  const [hours, setHours] = React.useState<OpeningHours>(
    initial ?? EMPTY_WEEK,
  );
  const [pending, startTransition] = React.useTransition();

  const errors = React.useMemo(() => {
    const e: Partial<Record<DayKey, string>> = {};
    for (const { key } of DAYS) {
      const d = hours[key];
      // A close earlier than open is a valid overnight window (e.g. 6pm to
      // 1am). Only an identical open and close is invalid (zero-length).
      if (d && toMinutes(d.close) === toMinutes(d.open)) {
        e[key] = "Open and close cannot be the same time";
      }
    }
    return e;
  }, [hours]);

  const hasErrors = Object.keys(errors).length > 0;

  function setDay(key: DayKey, value: DayHours | null) {
    setHours((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDay(key: DayKey, on: boolean) {
    setDay(key, on ? DEFAULT_HOURS : null);
  }

  function setOpen(key: DayKey, open: string) {
    setDay(key, { ...(hours[key] ?? DEFAULT_HOURS), open });
  }

  function setClose(key: DayKey, close: string) {
    setDay(key, { ...(hours[key] ?? DEFAULT_HOURS), close });
  }

  function onSave() {
    if (hasErrors) return;
    startTransition(async () => {
      const result = await updateOpeningHoursAction(hours);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.push("/onboarding/step-6");
    });
  }

  function onAlwaysOpen() {
    startTransition(async () => {
      const result = await clearOpeningHoursAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.push("/onboarding/step-6");
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const day = hours[key];
          const enabled = day !== null;
          const dayError = errors[key];
          return (
            <div
              key={key}
              className={cn(
                "border-border/70 bg-card flex flex-wrap items-center gap-3 rounded-lg border p-3",
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
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <TimePicker
                  label={`${label} open time`}
                  value={day?.open ?? ""}
                  onChange={(v) => setOpen(key, v)}
                  disabled={!enabled || pending}
                />
                <span className="text-muted-foreground text-sm">to</span>
                <TimePicker
                  label={`${label} close time`}
                  value={day?.close ?? ""}
                  onChange={(v) => setClose(key, v)}
                  disabled={!enabled || pending}
                />
                {day && isOvernight(day) ? (
                  <span className="text-muted-foreground text-xs">
                    next day
                  </span>
                ) : null}
              </div>
              {dayError ? (
                <p className="text-destructive w-full text-xs">{dayError}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={onAlwaysOpen}
          >
            Always open
          </Button>
          <button
            type="button"
            onClick={() => router.push("/onboarding/step-6")}
            disabled={pending}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors disabled:pointer-events-none"
          >
            Skip for now
          </button>
        </div>
        <Button
          type="button"
          onClick={onSave}
          disabled={pending || hasErrors}
          className="bg-brand-orange hover:bg-brand-orange/90 h-11 gap-2 rounded-xl px-6 text-sm"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save & continue
        </Button>
      </div>
    </div>
  );
}
