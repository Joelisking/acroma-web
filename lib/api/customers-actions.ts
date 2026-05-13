"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { Customer } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function updateCustomerAction(
  id: string,
  input: { name?: string; optedOut?: boolean },
): Promise<ActionResult<Customer>> {
  try {
    const data = await apiFetch<Customer>(`/customers/${id}`, {
      method: "PATCH",
      body: input,
    });
    revalidatePath("/dashboard/customers");
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't update customer" };
    }
    return { ok: false, error: "Couldn't update customer" };
  }
}
