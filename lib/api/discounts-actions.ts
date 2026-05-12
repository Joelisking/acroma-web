"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { Discount, DiscountType } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type DiscountInput = {
  code: string;
  type: DiscountType;
  value: number;
  validFrom?: string | null;
  validUntil?: string | null;
  totalUsageLimit?: number | null;
  perCustomerLimit?: number | null;
};

function cleanPayload(input: DiscountInput): Record<string, unknown> {
  const out: Record<string, unknown> = {
    code: input.code,
    type: input.type,
    value: input.value,
  };
  if (input.validFrom) out.validFrom = input.validFrom;
  if (input.validUntil) out.validUntil = input.validUntil;
  if (input.totalUsageLimit != null) out.totalUsageLimit = input.totalUsageLimit;
  if (input.perCustomerLimit != null) out.perCustomerLimit = input.perCustomerLimit;
  return out;
}

export async function createDiscountAction(
  input: DiscountInput,
): Promise<ActionResult<Discount>> {
  try {
    const discount = await apiFetch<Discount>("/discounts", {
      method: "POST",
      body: cleanPayload(input),
    });
    revalidatePath("/dashboard/discounts");
    return { ok: true, data: discount };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't create discount" };
    }
    return { ok: false, error: "Couldn't create discount" };
  }
}

export async function updateDiscountAction(
  id: string,
  input: Partial<DiscountInput> & { isActive?: boolean },
): Promise<ActionResult<Discount>> {
  try {
    const discount = await apiFetch<Discount>(`/discounts/${id}`, {
      method: "PATCH",
      body: input,
    });
    revalidatePath("/dashboard/discounts");
    revalidatePath(`/dashboard/discounts/${id}`);
    return { ok: true, data: discount };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't update discount" };
    }
    return { ok: false, error: "Couldn't update discount" };
  }
}

export async function deactivateDiscountAction(
  id: string,
): Promise<ActionResult<Discount>> {
  try {
    const discount = await apiFetch<Discount>(`/discounts/${id}`, {
      method: "DELETE",
    });
    revalidatePath("/dashboard/discounts");
    return { ok: true, data: discount };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't deactivate" };
    }
    return { ok: false, error: "Couldn't deactivate" };
  }
}
