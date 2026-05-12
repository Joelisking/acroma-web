import "server-only";

import { apiFetch } from "./server";
import type { Discount } from "./types";

export async function listDiscounts(includeInactive?: boolean): Promise<Discount[]> {
  const qs = includeInactive ? "?includeInactive=true" : "";
  return apiFetch<Discount[]>(`/discounts${qs}`);
}

export async function getDiscount(id: string): Promise<Discount> {
  return apiFetch<Discount>(`/discounts/${id}`);
}
