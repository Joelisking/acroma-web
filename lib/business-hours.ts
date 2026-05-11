import type { OpeningHours } from "@/lib/api/types";

const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function isOpen(
  hours: OpeningHours | null,
  nowUtc: Date,
): boolean {
  if (hours === null) return true;
  const dayKey = WEEKDAY_KEYS[nowUtc.getUTCDay()];
  const today = hours[dayKey];
  if (today === null) return false;
  const minutes = nowUtc.getUTCHours() * 60 + nowUtc.getUTCMinutes();
  return minutes >= toMinutes(today.open) && minutes < toMinutes(today.close);
}

export function nextOpenTime(
  hours: OpeningHours | null,
  nowUtc: Date,
): Date | null {
  if (hours === null) return null;
  if (isOpen(hours, nowUtc)) return null;

  for (let i = 0; i < 8; i++) {
    const candidate = new Date(nowUtc.getTime() + i * 86_400_000);
    const dayKey = WEEKDAY_KEYS[candidate.getUTCDay()];
    const dayHours = hours[dayKey];
    if (dayHours === null) continue;
    const [oh, om] = dayHours.open.split(":").map(Number);
    const open = new Date(
      Date.UTC(
        candidate.getUTCFullYear(),
        candidate.getUTCMonth(),
        candidate.getUTCDate(),
        oh,
        om,
      ),
    );
    if (open > nowUtc) return open;
  }
  return null;
}

function formatTime(d: Date): string {
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const period = h >= 12 ? "pm" : "am";
  const h12 = ((h + 11) % 12) + 1;
  return m === 0
    ? `${h12}${period}`
    : `${h12}:${String(m).padStart(2, "0")}${period}`;
}

export function formatNextOpen(nowUtc: Date, openAt: Date | null): string {
  if (!openAt) return "as soon as we can";

  const sameUtcDay =
    openAt.getUTCFullYear() === nowUtc.getUTCFullYear() &&
    openAt.getUTCMonth() === nowUtc.getUTCMonth() &&
    openAt.getUTCDate() === nowUtc.getUTCDate();

  const tomorrow = new Date(nowUtc.getTime() + 86_400_000);
  const isTomorrow =
    openAt.getUTCFullYear() === tomorrow.getUTCFullYear() &&
    openAt.getUTCMonth() === tomorrow.getUTCMonth() &&
    openAt.getUTCDate() === tomorrow.getUTCDate();

  const time = formatTime(openAt);
  if (sameUtcDay) return `today at ${time}`;
  if (isTomorrow) return `tomorrow at ${time}`;
  const dayName = WEEKDAY_LABELS[openAt.getUTCDay()];
  return `${dayName} at ${time}`;
}
