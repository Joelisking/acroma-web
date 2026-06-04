"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { regeneratePaymentLinkAction } from "@/lib/api/orders-actions";
import type { Order } from "@/lib/api/types";

// Statuses where a payment link can still legitimately be issued. Past
// PAID/PROCESSING/SHIPPED/DELIVERED there's nothing left to charge.
const REGENERATABLE: Order["status"][] = ["PAYMENT_PENDING", "PAYMENT_FAILED"];

export function PaymentLinkPanel({ order }: { order: Order }) {
  const [pending, startTransition] = React.useTransition();

  if (order.paymentMethod !== "MOMO") return null;
  if (!REGENERATABLE.includes(order.status)) return null;

  const showCurrentLink =
    order.status === "PAYMENT_PENDING" && order.paystackAuthUrl;

  function copyLink() {
    if (!order.paystackAuthUrl) return;
    void navigator.clipboard
      .writeText(order.paystackAuthUrl)
      .then(() => toast.success("Payment link copied"))
      .catch(() => toast.error("Couldn't copy link"));
  }

  function regenerate() {
    startTransition(async () => {
      const result = await regeneratePaymentLinkAction(order.id);
      if (!result.ok) toast.error(result.error);
      else
        toast.success(
          "New payment link sent to the customer on WhatsApp",
        );
    });
  }

  return (
    <section
      aria-label="Payment link"
      className="border-border/70 bg-card flex flex-col gap-4 rounded-2xl border p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground">Payment link</p>
          <p className="text-foreground mt-1 text-sm">
            {order.status === "PAYMENT_FAILED"
              ? "The last attempt failed. Send a fresh link to the customer."
              : "Awaiting payment. The customer was sent this link on WhatsApp."}
          </p>
        </div>
      </div>

      {showCurrentLink ? (
        <div className="bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2">
          <code className="text-foreground flex-1 truncate font-mono text-xs">
            {order.paystackAuthUrl}
          </code>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={copyLink}
            className="gap-1.5"
          >
            <Copy className="size-3.5" />
            Copy
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            asChild
            className="gap-1.5"
          >
            <a
              href={order.paystackAuthUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-3.5" />
              Open
            </a>
          </Button>
        </div>
      ) : null}

      <div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={regenerate}
          className="gap-1.5"
        >
          <RefreshCw className={pending ? "size-3.5 animate-spin" : "size-3.5"} />
          Send a new link
        </Button>
      </div>
    </section>
  );
}
