/**
 * Small, dependency-free formatters used across the app.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Render a timestamp as a compact relative label:
 *   <1m → "just now"
 *   <60m → "12m"
 *   <24h → "5h"
 *   <7d → "3d"
 *   else → "Mar 5"
 */
export function formatRelativeShort(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return "just now";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(diffMs / DAY_MS);
  if (days < 7) return `${days}d`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * E.164-ish phone display: "+233 24 123 4567" → "+233 24 123 4567" (passthrough
 * with light grouping if compact). Falls back to the input.
 */
export function formatPhone(phone: string): string {
  return phone.replace(/^(\+\d{3})(\d{2})(\d{3})(\d{4})$/, "$1 $2 $3 $4");
}

/**
 * Format a money amount using Intl. Falls back to "<currency> <number>" if
 * Intl can't resolve the currency code.
 */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

/** Short order id chip — last 6 of the uuid, uppercased. */
export function shortId(id: string): string {
  return id.replace(/-/g, "").slice(-6).toUpperCase();
}

/**
 * Compact summary of what was ordered, e.g. "2× Jollof Rice, 1× Soft Drink".
 * Returns "" for an empty list so callers can branch on it.
 */
export function formatItemsSummary(
  items: { quantity: number; productName?: string | null; product: { name: string } | null }[],
): string {
  return items
    .map((item) => `${item.quantity}× ${item.product?.name ?? item.productName ?? "Item"}`)
    .join(", ");
}

export function getInitials(name: string | null | undefined, fallback = "?") {
  if (!name) return fallback;
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || fallback
  );
}
