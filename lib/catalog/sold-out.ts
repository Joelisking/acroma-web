// Mirrors `src/products/sold-out.ts` on the backend. "Sold out today" is a
// daily flag set by the merchant; it auto-resets at the start of the next
// UTC day. The web side only reads the flag (mutations go through server
// actions), but it still needs the same staleness check so the dashboard
// doesn't show a "Sold out today" badge after the boundary has rolled over
// before the next refetch.

function startOfUtcDay(now: Date): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export function isSoldOutToday(
  soldOutAt: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!soldOutAt) return false;
  const parsed = new Date(soldOutAt);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() >= startOfUtcDay(now).getTime();
}
