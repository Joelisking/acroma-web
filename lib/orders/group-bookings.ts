import type { Order } from "@/lib/api/types";

export type DayBookings = { dayKey: string; date: Date; bookings: Order[] };

/** UTC day key "yyyy-mm-dd" for an ISO timestamp (Ghana is UTC). */
export function utcDayKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Day key "yyyy-mm-dd" from a Date's LOCAL fields. react-day-picker hands back
 * a local-midnight Date for the clicked cell; reading it with local fields (not
 * getUTC*) gives the day the merchant actually tapped, in any device timezone.
 */
export function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Split orders into scheduled (has scheduledFor) and unscheduled. */
export function splitScheduled(orders: Order[]): {
  scheduled: Order[];
  unscheduled: Order[];
} {
  const scheduled: Order[] = [];
  const unscheduled: Order[] = [];
  for (const o of orders) {
    if (o.scheduledFor) scheduled.push(o);
    else unscheduled.push(o);
  }
  return { scheduled, unscheduled };
}

/** Map of dayKey -> orders, each list sorted ascending by scheduledFor. */
export function groupByDay(orders: Order[]): Map<string, Order[]> {
  const map = new Map<string, Order[]>();
  for (const o of orders) {
    if (!o.scheduledFor) continue;
    const key = utcDayKey(o.scheduledFor);
    const list = map.get(key) ?? [];
    list.push(o);
    map.set(key, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) =>
      (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? ""),
    );
  }
  return map;
}

/**
 * Days that have at least one booking, as Dates anchored at NOON UTC so they
 * fall on the same calendar day in every device timezone (avoids the midnight
 * off-by-one that `react-day-picker` would otherwise hit rendering in local
 * time).
 */
export function bookedDays(orders: Order[]): Date[] {
  const keys = new Set<string>();
  for (const o of orders) if (o.scheduledFor) keys.add(utcDayKey(o.scheduledFor));
  return [...keys].map((k) => new Date(`${k}T12:00:00Z`));
}
