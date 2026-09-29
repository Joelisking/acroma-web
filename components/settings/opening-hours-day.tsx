"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TimePicker } from "@/components/ui/time-picker"
import type { DayHours, OpeningHours } from "@/lib/api/types"
import { isOvernight } from "@/lib/business-hours"
import { cn } from "@/lib/utils"

export function OpeningHoursDay({
  dayKey,
  label,
  day,
  error,
  pending,
  onToggle,
  onOpen,
  onClose,
}: {
  dayKey: keyof OpeningHours
  label: string
  day: DayHours | null
  error?: string
  pending: boolean
  onToggle: (on: boolean) => void
  onOpen: (value: string) => void
  onClose: (value: string) => void
}) {
  const enabled = day !== null
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-card p-3",
        error && "border-destructive"
      )}
    >
      <div className="flex w-32 items-center gap-3">
        <Switch
          id={`day-${dayKey}`}
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={pending}
        />
        <Label htmlFor={`day-${dayKey}`} className="text-sm font-medium">
          {label}
        </Label>
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <TimePicker
          label={`${label} open time`}
          value={day?.open ?? ""}
          onChange={onOpen}
          disabled={!enabled || pending}
        />
        <span className="text-sm text-muted-foreground">to</span>
        <TimePicker
          label={`${label} close time`}
          value={day?.close ?? ""}
          onChange={onClose}
          disabled={!enabled || pending}
        />
        {day && isOvernight(day) ? (
          <span className="text-xs text-muted-foreground">next day</span>
        ) : null}
      </div>
      {error ? (
        <p className="w-full text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
