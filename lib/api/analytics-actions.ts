"use server";

import { ApiError } from "./server";
import { getProductRevenue } from "./analytics";
import type { AnalyticsFilter, ProductRevenueReport } from "./types";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function getProductRevenueAction(
  filter: AnalyticsFilter,
): Promise<ActionResult<ProductRevenueReport>> {
  try {
    const data = await getProductRevenue(filter);
    return { ok: true, data };
  } catch (err) {
    const msg =
      err instanceof ApiError || err instanceof Error
        ? err.message
        : "Couldn't load product revenue";
    return { ok: false, error: msg || "Couldn't load product revenue" };
  }
}
