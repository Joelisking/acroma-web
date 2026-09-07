import type { WhatsappTemplate } from "./api/types"

/**
 * Acroma's counter payment-link template. Mirrors
 * `TILL_PAYMENT_TEMPLATE_NAME` in
 * `acroma-backend/src/whatsapp/till-payment-template.ts`.
 *
 * WhatsApp only carries a free-form message to a customer who wrote to the
 * business in the last 24 hours, and a walk-in at the counter has usually
 * never written. An approved template is the only way to reach them, so the
 * till's "Send link on WhatsApp" depends on this one existing.
 */
export const TILL_PAYMENT_TEMPLATE_NAME = "acroma_till_payment_link"

export function findTillPaymentTemplate(
  templates: WhatsappTemplate[]
): WhatsappTemplate | null {
  return (
    templates.find((t) => t.name === TILL_PAYMENT_TEMPLATE_NAME) ?? null
  )
}
