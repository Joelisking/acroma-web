"use server"

import { revalidatePath } from "next/cache"
import { apiFetch, ApiError } from "./server"

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/**
 * Backend `SendLinkResult`. A refused send is not an error: Meta's 24-hour
 * customer service window rejecting a stranger is the expected case, and the
 * answer is the QR already on the counter screen.
 */
type SendLinkResult =
  | { ok: true }
  | { ok: false; reason: "UNREACHABLE"; detail: string }

/**
 * Push an order's existing payment link to the customer over WhatsApp. The
 * till's deliberate fallback behind the QR, never automatic.
 */
export async function sendPaymentLinkAction(
  orderId: string
): Promise<ActionResult<SendLinkResult>> {
  try {
    const result = await apiFetch<SendLinkResult>(
      `/orders/${orderId}/send-link`,
      { method: "POST" }
    )
    revalidatePath("/dashboard/orders")
    return { ok: true, data: result }
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message || "Couldn't send the link" }
    }
    return { ok: false, error: "Couldn't send the link" }
  }
}
