"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type {
  CorrectOrderInput,
  CreateOrderInput,
  EditOrderInput,
  Order,
  OrderStatus,
} from "./types";

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

// Remove an order from the dashboard (soft-remove, recoverable). Cancels it
// first if it still holds reserved stock, then hides it from the default list.
export async function archiveOrderAction(
  orderId: string,
): Promise<ActionResult<Order>> {
  try {
    const order = await apiFetch<Order>(`/orders/${orderId}/archive`, {
      method: "PATCH",
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { ok: true, data: order };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't remove the order" };
    }
    return { ok: false, error: "Couldn't remove the order" };
  }
}

// Recover a removed order back into the list.
export async function unarchiveOrderAction(
  orderId: string,
): Promise<ActionResult<Order>> {
  try {
    const order = await apiFetch<Order>(`/orders/${orderId}/unarchive`, {
      method: "PATCH",
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { ok: true, data: order };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't restore the order" };
    }
    return { ok: false, error: "Couldn't restore the order" };
  }
}

export async function markOrdersPaidAction(
  orderIds: string[],
  amountPaid?: number,
): Promise<ActionResult<Order[]>> {
  try {
    const orders = await apiFetch<Order[]>(`/orders/mark-paid`, {
      method: "PATCH",
      body: { orderIds, ...(amountPaid != null ? { amountPaid } : {}) },
    });
    for (const id of orderIds) {
      revalidatePath(`/dashboard/orders/${id}`);
    }
    revalidatePath("/dashboard/orders");
    return { ok: true, data: orders };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't mark as paid" };
    }
    return { ok: false, error: "Couldn't mark as paid" };
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

export async function updateOrderNotesAction(
  orderId: string,
  notes: string,
): Promise<ActionResult<Order>> {
  const trimmed = notes.trim();
  if (trimmed.length > 2000) {
    return { ok: false, error: "Note is too long (max 2000 characters)" };
  }
  try {
    const order = await apiFetch<Order>(`/orders/${orderId}/notes`, {
      method: "PATCH",
      body: { notes: trimmed },
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { ok: true, data: order };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't save the note" };
    }
    return { ok: false, error: "Couldn't save the note" };
  }
}

export async function createOrderAction(
  input: CreateOrderInput,
): Promise<ActionResult<Order>> {
  try {
    const order = await apiFetch<Order>("/orders", {
      method: "POST",
      body: input,
    });
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/conversations");
    return { ok: true, data: order };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't create the order" };
    }
    return { ok: false, error: "Couldn't create the order" };
  }
}

export async function editOrderAction(
  orderId: string,
  input: EditOrderInput,
): Promise<ActionResult<Order>> {
  try {
    const order = await apiFetch<Order>(`/orders/${orderId}`, {
      method: "PATCH",
      body: input,
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { ok: true, data: order };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't update the order" };
    }
    return { ok: false, error: "Couldn't update the order" };
  }
}

// Merchant-initiated correction of a PAID order. Rewrites the lines and
// charges only the difference (or flags a refund when it drops below).
export async function correctOrderAction(
  orderId: string,
  input: CorrectOrderInput,
): Promise<ActionResult<Order>> {
  try {
    const order = await apiFetch<Order>(`/orders/${orderId}/correct`, {
      method: "POST",
      body: input,
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { ok: true, data: order };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't correct the order" };
    }
    return { ok: false, error: "Couldn't correct the order" };
  }
}

// Record the customer's mobile-money refund details, or mark a refund as sent.
export async function recordRefundAction(
  orderId: string,
  input: { momoNumber?: string; momoName?: string; markAs?: "refunded" },
): Promise<ActionResult<Order>> {
  try {
    const order = await apiFetch<Order>(`/orders/${orderId}/refund`, {
      method: "PATCH",
      body: input,
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { ok: true, data: order };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't save refund details" };
    }
    return { ok: false, error: "Couldn't save refund details" };
  }
}

export async function approveTopUpAction(
  orderId: string,
  topUpId: string,
): Promise<ActionResult<void>> {
  try {
    await apiFetch(`/orders/${orderId}/topups/${topUpId}/approve`, {
      method: "POST",
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't send the payment link" };
    }
    return { ok: false, error: "Couldn't send the payment link" };
  }
}

export async function rejectTopUpAction(
  orderId: string,
  topUpId: string,
): Promise<ActionResult<void>> {
  try {
    await apiFetch(`/orders/${orderId}/topups/${topUpId}/reject`, {
      method: "POST",
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't reject the change" };
    }
    return { ok: false, error: "Couldn't reject the change" };
  }
}
