"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { Order, OrderStatus } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
): Promise<ActionResult<Order>> {
  try {
    const order = await apiFetch<Order>(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: { status },
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { ok: true, data: order };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't update order" };
    }
    return { ok: false, error: "Couldn't update order" };
  }
}

export async function regeneratePaymentLinkAction(
  orderId: string,
): Promise<ActionResult<Order>> {
  try {
    const order = await apiFetch<Order>(
      `/orders/${orderId}/regenerate-payment-link`,
      { method: "POST" },
    );
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { ok: true, data: order };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        ok: false,
        error: err.message || "Couldn't regenerate payment link",
      };
    }
    return { ok: false, error: "Couldn't regenerate payment link" };
  }
}
