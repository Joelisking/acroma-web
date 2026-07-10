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
