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

export async function updateDeliveryAddressAction(
  orderId: string,
  deliveryAddress: string,
): Promise<ActionResult<Order>> {
  const trimmed = deliveryAddress.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "Address can't be empty" };
  }
  if (trimmed.length > 500) {
    return { ok: false, error: "Address is too long (max 500 characters)" };
  }
  try {
    const order = await apiFetch<Order>(`/orders/${orderId}/delivery-address`, {
      method: "PATCH",
      body: { deliveryAddress: trimmed },
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { ok: true, data: order };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        ok: false,
        error: err.message || "Couldn't update delivery address",
      };
    }
    return { ok: false, error: "Couldn't update delivery address" };
  }
}
