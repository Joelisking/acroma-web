import type { DayHours, OpeningHours } from "@/lib/api/types";

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

/**
 * A day whose close time is earlier than its open time runs past midnight,
 * e.g. 18:00 -> 01:00 — the window spans two calendar days. An equal
 * open/close is a zero-length window (treated as closed). Mirror of the
 * backend `business-hours.ts`; keep the two in sync.
 */
export function isOvernight(day: DayHours): boolean {
  return toMinutes(day.close) < toMinutes(day.open);
}

export function isOpen(
  hours: OpeningHours | null,
  nowUtc: Date,
): boolean {
  if (hours === null) return true;
  const minutes = nowUtc.getUTCHours() * 60 + nowUtc.getUTCMinutes();

  // Today's own window — the part of it that falls on this calendar day.
  const today = hours[WEEKDAY_KEYS[nowUtc.getUTCDay()]];
  if (today != null) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (isOvernight(today)) {
      if (minutes >= open) return true; // before midnight, still open
    } else if (minutes >= open && minutes < close) {
      return true;
    }
  }

  // Carry-over: an overnight window opened yesterday may still be running
  // (e.g. it's 00:30 now and yesterday's window closes at 01:00).
  const yesterday = hours[WEEKDAY_KEYS[(nowUtc.getUTCDay() + 6) % 7]];
  if (yesterday != null && isOvernight(yesterday)) {
    if (minutes < toMinutes(yesterday.close)) return true;
  }

  return false;
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
