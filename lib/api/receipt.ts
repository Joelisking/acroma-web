import "server-only";

const API_URL = process.env.ACROMA_API_URL;

export type ReceiptItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
};

// Mirrors prisma OrderStatus / PaymentMethod — kept character-identical with
// the backend enums (see acroma-backend/prisma/schema.prisma).
export type ReceiptOrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAID"
  | "PROCESSING"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "NO_SHOW"
  | "PAYMENT_FAILED";

export type ReceiptPaymentMethod = "MOMO" | "CASH_ON_DELIVERY";

export type ReceiptResult = {
  businessName: string;
  logoUrl: string | null;
  currency: string;
  orderId: string;
  createdAt: string;
  customerName: string | null;
  status: ReceiptOrderStatus;
  paymentMethod: ReceiptPaymentMethod;
  fulfillment: "DELIVERY" | "PICKUP";
  deliveryAddress: string | null;
  items: ReceiptItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
};

export async function getReceipt(token: string): Promise<ReceiptResult> {
  if (!API_URL) throw new Error("ACROMA_API_URL is not set");
  const res = await fetch(
    `${API_URL}/orders/receipt/${encodeURIComponent(token)}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`receipt ${res.status}`);
  return (await res.json()) as ReceiptResult;
}
