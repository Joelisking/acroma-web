"use client"
import { useEffect, useRef } from "react"
import type { Appointment } from "@/lib/real-estate"
import {
  appointmentsOnDay,
  dayLabel,
  daySegment,
  timelineLayout,
} from "@/lib/estate-calendar"
import { CalendarEvent } from "./calendar-event"

export function CalendarTimeline({
  days,
  appointments,
  onDay,
  onAppointment,
  onCreate,
}: {
  days: string[]
  appointments: Appointment[]
  onDay: (day: string) => void
  onAppointment: (id: string) => void
  onCreate: (day: string, time?: string) => void
}) {
  const segments = days.flatMap((day) =>
    appointmentsOnDay(appointments, day).map((a) => daySegment(a, day))
  )
  const firstHour = Math.floor(
    Math.min(8 * 60, ...segments.map((s) => s.start)) / 60
  )
  const lastHour = Math.ceil(
    Math.max(18 * 60, ...segments.map((s) => s.end)) / 60
  )
  const hours = Array.from(
    { length: lastHour - firstHour },
    (_, i) => firstHour + i
  )
  const rowHeight = 72
  const scrollArea = useRef<HTMLDivElement>(null)
  const initialScroll = useRef(Math.max(0, 8 - firstHour) * rowHeight)
  useEffect(() => {
    if (scrollArea.current) scrollArea.current.scrollTop = initialScroll.current
  }, [])
  return (
    <div
      ref={scrollArea}
      className="max-h-[70vh] overflow-y-auto overscroll-contain"
      aria-label={days.length === 1 ? "Day timeline" : "Week timeline"}
    >
      <div
        className="sticky top-0 z-20 grid border-b bg-card"
        style={{
          gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))`,
        }}
      >
        <span className="p-2 text-xs text-muted-foreground">UTC</span>
        {days.map((day) => (
          <button
            key={day}
            onClick={() => onDay(day)}
            className="min-w-0 border-l p-2 text-center text-xs font-semibold focus-visible:ring-2 focus-visible:ring-ring"
          >
            {dayLabel(day, {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </button>
        ))}
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))`,
        }}
      >
        <div>
          {hours.map((hour) => (
            <div
              key={hour}
              style={{ height: rowHeight }}
              className="pt-1 pr-2 text-right text-xs text-muted-foreground"
            >
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>
        {days.map((day) => (
          <div
            key={day}
            className="relative min-w-0 border-l"
            style={{ height: hours.length * rowHeight }}
          >
            {hours.map((hour) => (
              <button
                key={hour}
                aria-label={`Book on ${dayLabel(day)} at ${String(hour).padStart(2, "0")}:00`}
                onClick={() =>
                  onCreate(
                    day,
                    `${day}T${String(hour).padStart(2, "0")}:00:00Z`
                  )
                }
                className="block w-full border-b border-dashed border-border/70 hover:bg-accent/50 focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                style={{ height: rowHeight }}
              />
            ))}
            {timelineLayout(appointments, day).map(
              ({ appointment: a, start, end, lane, lanes }) => (
                <div
                  key={a.id}
                  className="absolute z-10 px-0.5 pb-0.5"
                  style={{
                    top: (start / 60 - firstHour) * rowHeight,
                    height: Math.max(22, ((end - start) / 60) * rowHeight),
                    left: `${(lane / lanes) * 100}%`,
                    width: `${100 / lanes}%`,
                  }}
                >
                  <div className="h-full overflow-hidden">
                    <CalendarEvent
                      appointment={a}
                      day={day}
                      compact={end - start < 45 || days.length > 1}
                      onClick={() => onAppointment(a.id)}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
