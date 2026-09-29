import type { Appointment } from "./real-estate"

export type CalendarView = "month" | "week" | "day"
/** A URL view is temporary; only the explicit settings action persists a default. */
export function resolveCalendarView(
  explicit: unknown,
  savedDefault?: unknown
): CalendarView {
  if (explicit === "month" || explicit === "week" || explicit === "day")
    return explicit
  if (savedDefault === "MONTH") return "month"
  if (savedDefault === "DAY") return "day"
  return "week"
}
export const dayDate = (day: string) => new Date(`${day}T00:00:00Z`)
export const dayKey = (date: Date) => date.toISOString().slice(0, 10)
export const shiftDay = (day: string, count: number) =>
  dayKey(new Date(+dayDate(day) + count * 86400000))
export const weekStart = (day: string) =>
  shiftDay(day, -((dayDate(day).getUTCDay() + 6) % 7))
export const dayLabel = (
  day: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }
) =>
  dayDate(day).toLocaleDateString("en-GB", {
    ...options,
    timeZone: "Africa/Accra",
  })
export const clockTime = (value: string) =>
  new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Accra",
  })

export function calendarRange(day: string, view: CalendarView) {
  const first =
    view === "month"
      ? weekStart(`${day.slice(0, 7)}-01`)
      : view === "week"
        ? weekStart(day)
        : day
  const count = view === "month" ? 42 : view === "week" ? 7 : 1
  const days = Array.from({ length: count }, (_, i) => shiftDay(first, i))
  return {
    days,
    from: `${first}T00:00:00Z`,
    to: `${shiftDay(first, count)}T00:00:00Z`,
  }
}

export function navigateDate(
  day: string,
  view: CalendarView,
  direction: number
) {
  if (view !== "month")
    return shiftDay(day, direction * (view === "week" ? 7 : 1))
  const date = dayDate(day)
  const target = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + direction, 1)
  )
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate()
  target.setUTCDate(Math.min(date.getUTCDate(), last))
  return dayKey(target)
}

export function appointmentsOnDay(appointments: Appointment[], day: string) {
  const start = +dayDate(day),
    end = start + 86400000
  return appointments
    .filter((a) => +new Date(a.startsAt) < end && +new Date(a.endsAt) > start)
    .sort(
      (a, b) => a.startsAt.localeCompare(b.startsAt) || a.id.localeCompare(b.id)
    )
}

export function currentAppointment(a: Appointment, now: number): Appointment {
  return a.status === "HOLD" &&
    a.holdExpiresAt &&
    +new Date(a.holdExpiresAt) <= now
    ? { ...a, status: "EXPIRED", paymentUrl: null }
    : a
}
export const statusLabel = (a: Appointment) =>
  ({
    HOLD: "Awaiting payment",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
    COMPLETED: "Completed",
  })[a.status]

export function daySegment(a: Appointment, day: string) {
  const midnight = +dayDate(day)
  return {
    start: Math.max(0, (+new Date(a.startsAt) - midnight) / 60000),
    end: Math.min(1440, (+new Date(a.endsAt) - midnight) / 60000),
  }
}

/** Assign columns so overlapping historical/cancelled entries remain clickable. */
export function timelineLayout(appointments: Appointment[], day: string) {
  const sorted = appointmentsOnDay(appointments, day).map((a) => ({
    appointment: a,
    ...daySegment(a, day),
    lane: 0,
    lanes: 1,
  }))
  let group: typeof sorted = [],
    ends: number[] = [],
    groupEnd = -1
  const finishGroup = () =>
    group.forEach((item) => {
      item.lanes = ends.length
    })
  for (const item of sorted) {
    if (item.start >= groupEnd) {
      finishGroup()
      group = []
      ends = []
      groupEnd = -1
    }
    let lane = ends.findIndex((end) => end <= item.start)
    if (lane < 0) lane = ends.length
    ends[lane] = item.end
    item.lane = lane
    group.push(item)
    groupEnd = Math.max(groupEnd, item.end)
  }
  finishGroup()
  return sorted
}
