"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "./server";
import type { Product } from "./types";

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
