import "server-only";

import { apiFetch } from "./server";
import type { Product, ProductVariant } from "./types";

export async function listProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products");
}

export async function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export async function listVariants(
  productId: string,
): Promise<ProductVariant[]> {
  return apiFetch<ProductVariant[]>(`/products/${productId}/variants`);
}
