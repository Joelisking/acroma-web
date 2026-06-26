import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getReceipt } from "@/lib/api/receipt";
import { formatMoney, shortId } from "@/lib/format";
import { PrintButton } from "@/components/receipt/print-button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  try {
    const receipt = await getReceipt(token);
    return { title: `Receipt · ${receipt.businessName}` };
  } catch {
    return { title: "Receipt" };
  }
}

export default async function ReceiptPage({ params }: Props) {
  const { token } = await params;

  let receipt;
  try {
    receipt = await getReceipt(token);
  } catch {
    notFound();
  }

  const date = new Date(receipt.createdAt).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="bg-paper min-h-screen px-4 py-10 print:bg-white print:p-0">
      <div className="card-warm mx-auto max-w-md overflow-hidden print:rounded-none print:border-0 print:shadow-none">
        {/* Merchant header */}
        <div className="flex items-center gap-3 rounded-t-xl bg-brand-orange-soft px-6 py-5">
          {receipt.logoUrl ? (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
              <Image
                src={receipt.logoUrl}
                alt={receipt.businessName}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-orange text-lg font-bold text-white">
              {receipt.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-brand-navy">
              {receipt.businessName}
            </p>
            <p className="text-xs text-muted-foreground">Receipt</p>
          </div>
        </div>

        {/* Order meta */}
        <div className="flex justify-between px-6 py-4 text-sm">
          <div>
            <p className="text-muted-foreground">Order</p>
            <p className="font-mono font-medium text-brand-navy">
              #{shortId(receipt.orderId)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium text-brand-navy">{date}</p>
          </div>
        </div>

        <div className="mx-6 border-t" />

        {/* Items */}
        <div className="space-y-2 px-6 py-4">
          {receipt.items.map((item, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-4 text-sm"
            >
              <div className="flex-1">
                <span className="font-medium text-brand-navy">
                  {item.productName}
                </span>
                <span className="ml-1 text-muted-foreground">
                  × {item.quantity}
                </span>
              </div>
              <span className="shrink-0 text-brand-navy">
                {formatMoney(item.unitPrice * item.quantity, receipt.currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="mx-6 border-t" />

        {/* Totals */}
        <div className="space-y-1 px-6 py-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatMoney(receipt.subtotal, receipt.currency)}</span>
          </div>
          {receipt.discountAmount > 0 && (
            <div className="flex justify-between text-brand-green">
              <span>Discount</span>
              <span>
                −{formatMoney(receipt.discountAmount, receipt.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-brand-navy">
            <span>Total paid</span>
            <span>{formatMoney(receipt.totalAmount, receipt.currency)}</span>
          </div>
        </div>

        {/* Delivery info */}
        {(receipt.deliveryAddress ||
          receipt.fulfillment === "PICKUP") && (
          <>
            <div className="mx-6 border-t" />
            <div className="px-6 py-4 text-sm">
              <p className="text-muted-foreground">
                {receipt.fulfillment === "PICKUP"
                  ? "Pickup order"
                  : "Deliver to"}
              </p>
              {receipt.deliveryAddress && (
                <p className="font-medium text-brand-navy">
                  {receipt.deliveryAddress}
                </p>
              )}
            </div>
          </>
        )}

        {/* Print button */}
        <div className="rounded-b-xl px-6 pb-6 pt-2">
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
