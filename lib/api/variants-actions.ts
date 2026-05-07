"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { ProductVariant, VariantDimension } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type SaveVariantsInput = {
  dimensions: VariantDimension[];
  variants: Array<{
    attributes: Record<string, string>;
    stock: number;
    priceOverride?: number | null;
    imageUrl?: string | null;
    isActive: boolean;
  }>;
};

export async function suggestVariantsAction(
  productId: string,
  productName: string,
): Promise<ActionResult<{ suggestions: VariantDimension[] }>> {
  try {
    const data = await apiFetch<{ suggestions: VariantDimension[] }>(
      `/products/${productId}/variants/suggest`,
      { method: "POST", body: { productName } },
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't suggest variants") };
  }
}

export async function saveVariantsAction(
  productId: string,
  input: SaveVariantsInput,
): Promise<ActionResult<ProductVariant[]>> {
  try {
    const data = await apiFetch<ProductVariant[]>(
      `/products/${productId}/variants`,
      { method: "POST", body: input },
    );
    revalidatePath(`/dashboard/catalog/${productId}`);
    revalidatePath("/dashboard/catalog");
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't save variants") };
  }
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
