import type {
  ReceiptOrderStatus,
  ReceiptPaymentMethod,
} from "@/lib/api/receipt";

export type ReceiptTone = "paid" | "pending" | "cash" | "failed";

export type ReceiptStatus = {
  label: string;
  tone: ReceiptTone;
};

// Statuses that mean the money is in (for an online order) or the order has
// progressed past payment.
const SETTLED: ReceiptOrderStatus[] = [
  "PAID",
  "PROCESSING",
  "PREPARING",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
];

const FAILED: ReceiptOrderStatus[] = [
  "PAYMENT_FAILED",
  "CANCELLED",
  "NO_SHOW",
];

/**
 * Present an honest payment status for the receipt. A cash / pay-in-person
 * order isn't "Paid" online — it reads as "Pay in person" until the order has
 * actually been fulfilled. Pure so it can be reasoned about and tested without
 * a component.
 */
export function receiptStatus(
  status: ReceiptOrderStatus,
  method: ReceiptPaymentMethod,
): ReceiptStatus {
  if (FAILED.includes(status)) {
    return {
      label: status === "PAYMENT_FAILED" ? "Payment failed" : "Cancelled",
      tone: "failed",
    };
  }

  const settled = SETTLED.includes(status);

  if (method === "CASH_ON_DELIVERY") {
    return settled
      ? { label: "Paid", tone: "paid" }
      : { label: "Pay in person", tone: "cash" };
  }

  return settled
    ? { label: "Paid", tone: "paid" }
    : { label: "Payment pending", tone: "pending" };
}

export function paymentMethodLabel(method: ReceiptPaymentMethod): string {
  return method === "CASH_ON_DELIVERY" ? "Cash on delivery" : "Mobile Money";
}
