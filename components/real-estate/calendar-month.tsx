"use client"
import type { KeyboardEvent } from "react"
import type { Appointment } from "@/lib/real-estate"
import { appointmentsOnDay, dayLabel } from "@/lib/estate-calendar"
import { cn } from "@/lib/utils"
import { CalendarEvent } from "./calendar-event"

export function CalendarMonth({
  days,
  day,
  today,
  appointments,
  onDay,
  onAppointment,
}: {
  days: string[]
  day: string
  today: string
  appointments: Appointment[]
  onDay: (day: string) => void
  onAppointment: (id: string) => void
}) {
  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -(index % 7),
      End: 6 - (index % 7),
    }
    if (!(event.key in offsets)) return
    event.preventDefault()
    const target = days[index + offsets[event.key]]
    if (target)
      event.currentTarget
        .closest("table")
        ?.querySelector<HTMLButtonElement>(`[data-day="${target}"]`)
        ?.focus()
  }
  return (
    <table
      className="w-full table-fixed border-collapse"
      aria-label="Month appointments"
    >
      <thead>
        <tr>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((name) => (
            <th
              key={name}
              scope="col"
              className="border-b p-2 text-xs font-medium text-muted-foreground"
            >
              {name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }, (_, row) => (
          <tr key={row}>
            {days.slice(row * 7, row * 7 + 7).map((date, column) => {
              const rows = appointmentsOnDay(appointments, date)
              return (
                <td
                  key={date}
                  className={cn(
                    "h-24 border-r border-b p-1 align-top last:border-r-0 sm:h-40 sm:p-2",
                    date.slice(0, 7) !== day.slice(0, 7) && "bg-muted/40",
                    date === day && "bg-accent/40"
                  )}
                >
                  <button
                    type="button"
                    data-day={date}
                    tabIndex={date === day ? 0 : -1}
                    onKeyDown={(e) => moveFocus(e, row * 7 + column)}
                    onClick={() => onDay(date)}
                    aria-label={`${dayLabel(date)}, ${rows.length} appointments`}
                    aria-current={date === today ? "date" : undefined}
                    className={cn(
                      "flex min-h-9 w-full items-center justify-center rounded-md text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-9",
                      date === today
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    {Number(date.slice(-2))}
                  </button>
                  {rows.length > 0 && (
                    <button
                      onClick={() => onDay(date)}
                      className="mt-2 w-full rounded px-0.5 py-1 text-center text-xs font-medium text-primary focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
                      aria-label={`View all ${rows.length} appointments on ${dayLabel(date)}`}
                    >
                      {rows.length}{" "}
                      <span className="sr-only">appointments</span>
                    </button>
                  )}
                  <div className="mt-1 hidden space-y-1 sm:block">
                    {rows.slice(0, 3).map((a) => (
                      <CalendarEvent
                        key={a.id}
                        appointment={a}
                        day={date}
                        compact
                        onClick={() => onAppointment(a.id)}
                      />
                    ))}
                    {rows.length > 3 && (
                      <button
                        onClick={() => onDay(date)}
                        className="w-full rounded py-1 text-left text-xs font-medium text-primary focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        +{rows.length - 3} more
                      </button>
                    )}
                  </div>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
