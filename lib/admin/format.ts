/** Convert integer micro-USD (millionths of a USD) to a USD float. */
export function microUsdToUsd(n: number): number {
  return n / 1_000_000;
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

/**
 * Format an integer micro-USD amount as a USD currency string. Small values
 * keep up to 6 fraction digits (e.g. `$0.008700`); larger ones read normally
 * (e.g. `$12.34`).
 */
export function formatUsd(microUsd: number): string {
  return usdFormatter.format(microUsdToUsd(microUsd));
}

const tokenFormatter = new Intl.NumberFormat("en-US");

/** Format an integer token count with thousands separators (e.g. `1,234`). */
export function formatTokens(n: number): string {
  return tokenFormatter.format(n);
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

/** "5 Jun, 14:02" in UTC (Ghana time), for admin tables. */
export function formatDateTime(iso: string | null): string {
  return iso ? `${dateTimeFormatter.format(new Date(iso))} UTC` : "Never";
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

const RANGE_HOURS: Record<string, number> = { "24h": 24, "7d": 168, "30d": 720 };

/** Maps a `?range=` value to an ISO `from`, or undefined for "all time". */
export function rangeToFrom(range: string | undefined): string | undefined {
  const hours = range ? RANGE_HOURS[range] : undefined;
  return hours ? new Date(Date.now() - hours * 3_600_000).toISOString() : undefined;
}

/** Only the levels the backend stores; anything else means "all levels". */
export function pickLevel(level: string | undefined): "warn" | "error" | undefined {
  return level === "warn" || level === "error" ? level : undefined;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A uuid search param, or undefined (so a bad value can't 400 the page). */
export function pickUuid(v: string | undefined): string | undefined {
  return v && UUID.test(v) ? v : undefined;
}
