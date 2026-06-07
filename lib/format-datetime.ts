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
  }).format(new Date(iso));
}
