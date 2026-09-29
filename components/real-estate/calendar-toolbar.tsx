"use client"
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  dayLabel,
  navigateDate,
  weekStart,
  shiftDay,
  type CalendarView,
} from "@/lib/estate-calendar"
import { EstateDayPicker } from "./estate-day-picker"

export function CalendarToolbar({
  day,
  view,
  today,
  pending,
  onNavigate,
  onCreate,
  onRefresh,
}: {
  day: string
  view: CalendarView
  today: string
  pending: boolean
  onNavigate: (day: string, view: CalendarView) => void
  onCreate: () => void
  onRefresh: () => void
}) {
  const heading =
    view === "month"
      ? dayLabel(day, { month: "long", year: "numeric" })
      : view === "week"
        ? `${dayLabel(weekStart(day), { day: "numeric", month: "short" })} – ${dayLabel(shiftDay(weekStart(day), 6), { day: "numeric", month: "short", year: "numeric" })}`
        : dayLabel(day, {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
  return (
    <div className="space-y-4 border-b p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Previous ${view}`}
            disabled={pending}
            onClick={() => onNavigate(navigateDate(day, view, -1), view)}
          >
            <ChevronLeft />
          </Button>
          <h2
            aria-live="polite"
            className="min-w-0 text-base font-semibold sm:text-xl"
          >
            {heading}
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Next ${view}`}
            disabled={pending}
            onClick={() => onNavigate(navigateDate(day, view, 1), view)}
          >
            <ChevronRight />
          </Button>
        </div>
        <Button onClick={onCreate}>
          <Plus />
          Book appointment
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => onNavigate(today, view)}
          >
            Today
          </Button>
          <EstateDayPicker
            day={day}
            onChange={(date) => onNavigate(date, view)}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh calendar"
            disabled={pending}
            onClick={onRefresh}
          >
            <RefreshCw className={pending ? "animate-spin" : ""} />
          </Button>
        </div>
        <div
          role="group"
          aria-label="Calendar view"
          className="flex rounded-lg bg-muted p-1"
        >
          {(["month", "week", "day"] as const).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={view === v ? "secondary" : "ghost"}
              aria-pressed={view === v}
              disabled={pending}
              onClick={() => onNavigate(day, v)}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand-blue" />
          Viewings
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand-green" />
          Consultations
        </span>
        <span>One agency calendar · Ghana time (UTC)</span>
      </div>
    </div>
  )
}
