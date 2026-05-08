import "server-only";

const API_URL = process.env.ACROMA_API_URL;

export type PaymentStatusResult =
  | { status: "unknown" }
  | {
      status: "paid" | "pending" | "failed" | "cancelled";
      totalAmount: number;
      currency: string;
    };

/**
 * Public lookup for the customer-facing /payment-complete page. Hits the
 * unauth `GET /orders/payment-status` endpoint, which itself reconciles with
 * Paystack on demand — so even if the webhook hasn't landed yet, the page
 * still converges to the right state.
 */
export async function getPaymentStatus(
  reference: string,
): Promise<PaymentStatusResult> {
  if (!API_URL) {
    throw new Error("ACROMA_API_URL is not set");
  }
  const res = await fetch(
    `${API_URL}/orders/payment-status?reference=${encodeURIComponent(reference)}`,
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error(`payment-status ${res.status}`);
  return (await res.json()) as PaymentStatusResult;
}
