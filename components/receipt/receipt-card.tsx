import Image from "next/image";
import { formatMoney, shortId } from "@/lib/format";
import {
  paymentMethodLabel,
  receiptStatus,
  type ReceiptTone,
} from "@/lib/receipt-status";
import type { ReceiptResult } from "@/lib/api/receipt";
import { StatusPill } from "./status-pill";
import { PrintButton } from "./print-button";

const HERO_LABEL: Record<ReceiptTone, string> = {
  paid: "Total paid",
  pending: "Amount due",
  cash: "To pay in person",
  failed: "Order total",
};

// The hero panel is the emotional anchor: green when the money is in, warm
// orange when there's still something to pay, muted when the order fell through.
const HERO_BG: Record<ReceiptTone, string> = {
  paid: "bg-brand-green-soft",
  pending: "bg-brand-orange-soft",
  cash: "bg-brand-blue-soft",
  failed: "bg-muted",
};

// A dashed tear-line between sections — the one detail that reads unmistakably
// as a receipt. Prints crisply too.
function Tear() {
  return <div className="mx-6 border-t border-dashed border-border" />;
}

export function ReceiptCard({ receipt }: { receipt: ReceiptResult }) {
  const status = receiptStatus(receipt.status, receipt.paymentMethod);
  const date = new Date(receipt.createdAt).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="card-warm mx-auto max-w-md overflow-hidden print:rounded-none print:border-0 print:shadow-none">
      {/* Brand tab */}
      <div className="h-1.5 bg-brand-orange" />

      {/* Merchant header */}
      <header className="flex items-center gap-3 px-6 pt-5 pb-4">
        {receipt.logoUrl ? (
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={receipt.logoUrl}
              alt={receipt.businessName}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-lg font-bold text-white">
            {receipt.businessName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-brand-navy">
            {receipt.businessName}
          </p>
          <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-widest uppercase">
            Receipt
          </p>
        </div>
        <StatusPill status={status} />
      </header>

      {/* Amount hero */}
      <div className="px-6 pb-5">
        <div
          className={`rounded-2xl px-5 py-4 text-center ${HERO_BG[status.tone]}`}
        >
          <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-widest uppercase">
            {HERO_LABEL[status.tone]}
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-brand-navy tabular-nums">
            {formatMoney(receipt.totalAmount, receipt.currency)}
          </p>
        </div>
      </div>

      <Tear />

      {/* Order meta */}
      <div className="grid grid-cols-2 gap-4 px-6 py-4 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Order</p>
          <p className="font-mono font-medium text-brand-navy">
            #{shortId(receipt.orderId)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">Date</p>
          <p className="font-medium text-brand-navy">{date}</p>
        </div>
        {receipt.customerName && (
          <div className="col-span-2">
            <p className="text-muted-foreground text-xs">For</p>
            <p className="font-medium text-brand-navy">{receipt.customerName}</p>
          </div>
        )}
      </div>

      <Tear />

      {/* Items */}
      <ul className="space-y-3 px-6 py-4">
        {receipt.items.map((item, i) => (
          <li key={i} className="flex items-start justify-between gap-4 text-sm">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <span className="mt-px shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-brand-navy tabular-nums">
                {item.quantity}×
              </span>
              <span className="font-medium text-brand-navy">
                {item.productName}
              </span>
            </div>
            <span className="shrink-0 text-brand-navy tabular-nums">
              {formatMoney(item.unitPrice * item.quantity, receipt.currency)}
            </span>
          </li>
        ))}
      </ul>

      <Tear />

      {/* Totals */}
      <div className="space-y-1.5 px-6 py-4 text-sm">
        <div className="text-muted-foreground flex justify-between">
          <span>Subtotal</span>
          <span className="tabular-nums">
            {formatMoney(receipt.subtotal, receipt.currency)}
          </span>
        </div>
        {receipt.discountAmount > 0 && (
          <div className="flex justify-between text-brand-green">
            <span>Discount</span>
            <span className="tabular-nums">
              −{formatMoney(receipt.discountAmount, receipt.currency)}
            </span>
          </div>
        )}
        <div className="mt-1 flex justify-between border-t pt-2 text-base font-semibold text-brand-navy">
          <span>Total</span>
          <span className="tabular-nums">
            {formatMoney(receipt.totalAmount, receipt.currency)}
          </span>
        </div>
        <div className="text-muted-foreground flex justify-between pt-1 text-xs">
          <span>Payment</span>
          <span>{paymentMethodLabel(receipt.paymentMethod)}</span>
        </div>
      </div>

      {/* Fulfillment */}
      {(receipt.deliveryAddress || receipt.fulfillment === "PICKUP") && (
        <>
          <Tear />
          <div className="px-6 py-4 text-sm">
            <p className="text-muted-foreground text-xs">
              {receipt.fulfillment === "PICKUP" ? "Pickup order" : "Deliver to"}
            </p>
            {receipt.deliveryAddress && (
              <p className="font-medium text-brand-navy">
                {receipt.deliveryAddress}
              </p>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="px-6 pt-2 pb-6">
        <p className="text-muted-foreground mb-4 text-center text-sm">
          Thank you for your order.
        </p>
        <PrintButton />
        <p className="text-muted-foreground mt-5 text-center text-[0.7rem] tracking-wide">
          Powered by <span className="font-bold text-brand-orange">Acroma</span>
        </p>
      </div>
    </article>
  );
}
