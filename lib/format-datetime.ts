import { format, isSameDay, isSameYear, subDays } from "date-fns"

// Human appointment time, e.g. "Fri 6 Jun, 2:00 PM". Ghana is UTC, so we
// render in UTC for a stable, location-correct label.
export function formatAppointment(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(iso))
}

// Label for the day a chat message belongs to, in the viewer's timezone so it
// agrees with the time printed under each message.
export function formatChatDay(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  if (isSameDay(date, now)) return "Today"
  if (isSameDay(date, subDays(now, 1))) return "Yesterday"
  return format(date, isSameYear(date, now) ? "EEE d MMM" : "EEE d MMM yyyy")
}

export function isNewChatDay(iso: string, previousIso?: string): boolean {
  return !previousIso || !isSameDay(new Date(iso), new Date(previousIso))
}
