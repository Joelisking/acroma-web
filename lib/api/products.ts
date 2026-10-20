import "server-only";

import { apiFetch } from "./server";
import type { Product, ProductVariant } from "./types";

/**
 * The regular catalog by default. `forSale` adds the live promotion's
 * promo-only items (till, order editor); `promotionId` lists one promotion's
 * items. Every product carries `effectivePrice`, the price charged right now.
 */
export async function listProducts(
  opts: { forSale?: boolean; promotionId?: string } = {},
): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (opts.forSale) qs.set("forSale", "true");
  if (opts.promotionId) qs.set("promotionId", opts.promotionId);
  const q = qs.toString();
  return apiFetch<Product[]>(`/products${q ? `?${q}` : ""}`);
}

export async function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export async function listVariants(
  productId: string,
): Promise<ProductVariant[]> {
  return apiFetch<ProductVariant[]>(`/products/${productId}/variants`);
}
