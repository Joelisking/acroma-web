import type { Order } from "@/lib/api/types";

export type DayBookings = { dayKey: string; date: Date; bookings: Order[] };

/** UTC day key "yyyy-mm-dd" for an ISO timestamp (Ghana is UTC). */
export function utcDayKey(iso: string): string {
  return iso.slice(0, 10);
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

/** Days (as UTC-midnight Date) that have at least one booking. */
export function bookedDays(orders: Order[]): Date[] {
  const keys = new Set<string>();
  for (const o of orders) if (o.scheduledFor) keys.add(utcDayKey(o.scheduledFor));
  return [...keys].map((k) => new Date(`${k}T00:00:00Z`));
}
