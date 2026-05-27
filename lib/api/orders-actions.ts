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

// Quick-reply: "Sold out, cancel order". Cancels the order, marks every
// product on it sold-out-today, and sends a customer apology.
export async function markOrderSoldOutAction(
  orderId: string,
): Promise<ActionResult<Order>> {
  try {
    const order = await apiFetch<Order>(`/orders/${orderId}/sold-out-now`, {
      method: "POST",
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { ok: true, data: order };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't cancel the order" };
    }
    return { ok: false, error: "Couldn't cancel the order" };
  }
}

// Quick-reply: "Running a few minutes late". Sends the customer a templated
// wait message without changing order status.
export async function delayOrderAction(
  orderId: string,
  minutes?: number,
): Promise<ActionResult<Order>> {
  try {
    const order = await apiFetch<Order>(`/orders/${orderId}/delay`, {
      method: "POST",
      body: typeof minutes === "number" ? { minutes } : {},
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { ok: true, data: order };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        ok: false,
        error: err.message || "Couldn't send the delay message",
      };
    }
    return { ok: false, error: "Couldn't send the delay message" };
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
