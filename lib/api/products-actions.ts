"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "./server";
import type { Product, ProductTag } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type ProductInput = {
  name: string;
  description?: string;
  basePrice: number;
  stock?: number;
  imageUrl?: string;
  isActive?: boolean;
  category?: string;
  /**
   * Optional dietary / allergen tags. Sending an empty array clears any
   * previously-set tags on update; omitting the field entirely leaves
   * existing tags alone (backend uses Prisma `set:` semantics).
   */
  tags?: ProductTag[];
};

export async function createProductAction(
  input: ProductInput,
): Promise<ActionResult<Product>> {
  try {
    const product = await apiFetch<Product>("/products", {
      method: "POST",
      body: input,
    });
    revalidatePath("/dashboard/catalog");
    return { ok: true, data: product };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't create product") };
  }
}

export async function updateProductAction(
  id: string,
  input: ProductInput,
): Promise<ActionResult<Product>> {
  try {
    const product = await apiFetch<Product>(`/products/${id}`, {
      method: "PATCH",
      body: input,
    });
    revalidatePath("/dashboard/catalog");
    revalidatePath(`/dashboard/catalog/${id}`);
    return { ok: true, data: product };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't save product") };
  }
}

type SoldOutToggleResult = {
  id: string;
  name: string;
  soldOutAt: string | null;
};

export async function markSoldOutTodayAction(
  id: string,
): Promise<ActionResult<SoldOutToggleResult>> {
  try {
    const result = await apiFetch<SoldOutToggleResult>(
      `/products/${id}/sold-out-today`,
      { method: "POST" },
    );
    revalidatePath("/dashboard/catalog");
    revalidatePath(`/dashboard/catalog/${id}`);
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't mark sold out") };
  }
}

export async function clearSoldOutTodayAction(
  id: string,
): Promise<ActionResult<SoldOutToggleResult>> {
  try {
    const result = await apiFetch<SoldOutToggleResult>(
      `/products/${id}/sold-out-today`,
      { method: "DELETE" },
    );
    revalidatePath("/dashboard/catalog");
    revalidatePath(`/dashboard/catalog/${id}`);
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't bring item back") };
  }
}

export async function deleteProductAction(id: string): Promise<void> {
  try {
    await apiFetch<void>(`/products/${id}`, { method: "DELETE" });
  } catch (err) {
    // Surface via error.tsx; redirect anyway so the user isn't stuck.
    console.error(err);
  }
  revalidatePath("/dashboard/catalog");
  redirect("/dashboard/catalog");
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
