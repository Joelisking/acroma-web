"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  clearOpeningHoursAction,
  updateOpeningHoursAction,
} from "@/lib/api/settings-actions"
import {
  isOpen,
  nextOpenTime,
  formatNextOpen,
  toMinutes,
} from "@/lib/business-hours"
import type { DayHours, OpeningHours } from "@/lib/api/types"
import { OpeningHoursDay } from "./opening-hours-day"

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

const DAYS: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
]

const DEFAULT_HOURS: DayHours = { open: "09:00", close: "22:00" }

const EMPTY_WEEK: OpeningHours = {
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
  sunday: null,
}

type Props = {
  initial: OpeningHours | null
  purpose?: "business" | "appointments"
}

export function OpeningHoursForm({ initial, purpose = "business" }: Props) {
  const [hours, setHours] = React.useState<OpeningHours>(initial ?? EMPTY_WEEK)
  const [savedAlwaysOpen, setSavedAlwaysOpen] = React.useState(initial === null)
  const [pending, startTransition] = React.useTransition()

  const errors = React.useMemo(() => {
    const e: Partial<Record<DayKey, string>> = {}
    for (const { key } of DAYS) {
      const d = hours[key]
      // A close earlier than open is a valid overnight window (e.g. 6pm to
      // 1am). Only an identical open and close is invalid (zero-length).
      if (d && toMinutes(d.close) === toMinutes(d.open)) {
        e[key] = "Open and close cannot be the same time"
      }
    }
    return e
  }, [hours])

  const hasErrors = Object.keys(errors).length > 0

  const allDaysClosed = React.useMemo(
    () => DAYS.every(({ key }) => hours[key] === null),
    [hours]
  )

  const statusLine = React.useMemo(() => {
    if (purpose === "appointments") {
      return savedAlwaysOpen
        ? "Saved availability: always open, every day. Save weekly hours below to limit availability."
        : "Choose weekly working hours in Ghana time. Saving every day off closes the calendar to new appointments."
    }
    if (savedAlwaysOpen && allDaysClosed) {
      return "Currently: always open. Add hours below to start auto-replying when closed."
    }
    const now = new Date()
    if (isOpen(hours, now)) {
      return "Currently: open."
    }
    const friendly = formatNextOpen(now, nextOpenTime(hours, now))
    return `Currently: closed. Opens ${friendly}.`
  }, [hours, purpose, allDaysClosed, savedAlwaysOpen])

  function setDay(key: DayKey, value: DayHours | null) {
    setHours((prev) => ({ ...prev, [key]: value }))
  }

  function toggleDay(key: DayKey, on: boolean) {
    setDay(key, on ? DEFAULT_HOURS : null)
  }

  function setOpen(key: DayKey, open: string) {
    const current = hours[key] ?? DEFAULT_HOURS
    setDay(key, { ...current, open })
  }

  function setClose(key: DayKey, close: string) {
    const current = hours[key] ?? DEFAULT_HOURS
    setDay(key, { ...current, close })
  }

  function onSave() {
    if (hasErrors) return
    startTransition(async () => {
      const result = await updateOpeningHoursAction(hours)
      if (!result.ok) {
        toast.error(result.error)
      } else {
        setSavedAlwaysOpen(false)
        toast.success(
          purpose === "appointments"
            ? "Shared availability saved"
            : "Opening hours saved"
        )
      }
    })
  }

  function onAlwaysOpen() {
    startTransition(async () => {
      const result = await clearOpeningHoursAction()
      if (!result.ok) {
        toast.error(result.error)
      } else {
        toast.success(
          purpose === "appointments"
            ? "Shared availability saved: always open"
            : "Set to always open"
        )
        setHours(EMPTY_WEEK)
        setSavedAlwaysOpen(true)
      }
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{statusLine}</p>

      <div className="space-y-3">
        {DAYS.map(({ key, label }) => (
          <OpeningHoursDay
            key={key}
            dayKey={key}
            label={label}
            day={hours[key]}
            error={errors[key]}
            pending={pending}
            onToggle={(on) => toggleDay(key, on)}
            onOpen={(value) => setOpen(key, value)}
            onClose={(value) => setClose(key, value)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending || savedAlwaysOpen}
          onClick={onAlwaysOpen}
        >
          Always open
        </Button>
        <Button type="button" onClick={onSave} disabled={pending || hasErrors}>
          {pending
            ? "Saving…"
            : purpose === "appointments"
              ? "Save shared availability"
              : "Save"}
        </Button>
      </div>
    </div>
  )
}
