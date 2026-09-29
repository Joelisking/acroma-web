"use client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Appointment } from "@/lib/real-estate"
import { appointmentsOnDay, dayLabel } from "@/lib/estate-calendar"
import { CalendarEvent } from "./calendar-event"

export function CalendarAgenda({
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
  onCreate: (day: string) => void
}) {
  return (
    <div className="divide-y">
      {days.map((day) => {
        const rows = appointmentsOnDay(appointments, day)
        return (
          <section key={day} className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => onDay(day)}
                className="rounded text-left font-semibold focus-visible:ring-2 focus-visible:ring-ring"
              >
                {dayLabel(day, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({rows.length})
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onCreate(day)}
                aria-label={`Book on ${dayLabel(day)}`}
              >
                <Plus />
              </Button>
            </div>
            {rows.length ? (
              rows.map((a) => (
                <div key={a.id} className="h-20">
                  <CalendarEvent
                    appointment={a}
                    day={day}
                    onClick={() => onAppointment(a.id)}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No appointments. Choose + to book.
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}
