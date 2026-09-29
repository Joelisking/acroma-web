import { z } from "zod"
import type { Appointment, PaymentState } from "./real-estate"
export const refundAccountInput = z.object({
  bankId: z.string().regex(/^[1-9]\d{0,19}$/, "Choose a bank"),
  accountNumber: z
    .string()
    .regex(/^\d{6,25}$/, "Enter the customer’s account number"),
})
export const refundBanksSchema = z.array(
  z.object({ id: z.string(), code: z.string(), name: z.string() })
)
export type RefundBank = z.infer<typeof refundBanksSchema>[number]
export const refundLabels = {
  REQUESTED: "Refund requested",
  UNKNOWN: "Refund confirmation pending",
  PENDING: "Refund pending",
  PROCESSING: "Refund processing",
  NEEDS_ATTENTION: "Customer bank details needed",
  COMPLETED: "Refund completed",
  FAILED: "Refund failed",
  REVIEW_REQUIRED: "Refund needs support",
} as const
export function refundLabel(a: Appointment) {
  return a.refund
    ? refundLabels[a.refund.status]
    : a.paymentStatus === "REFUNDED"
      ? "Refund recorded"
      : "Refund due"
}

export function customerRefundMessage(result: PaymentState) {
  switch (result.refundStatus) {
    case "COMPLETED":
      return "Your refund has been processed. It may take up to 10 business days to appear in your account. This appointment is not booked."
    case "REQUESTED":
    case "UNKNOWN":
    case "PENDING":
    case "PROCESSING":
      return "Your agency has requested your refund through Acroma. It is still being processed. This appointment is not booked."
    case "NEEDS_ATTENTION":
      return "Your refund needs your bank details. Contact the agency so they can complete it in Acroma. This appointment is not booked."
    case "FAILED":
    case "REVIEW_REQUIRED":
      return "Your refund needs follow-up. Contact the agency for help. This appointment is not booked."
    default:
      return result.paymentStatus === "REFUNDED"
        ? "The agency recorded your refund. Contact them to confirm it. This appointment is not booked."
        : "Your payment was received, but this appointment is not booked. Contact the agency to request your refund and choose another time."
  }
}
