"use client";

import * as React from "react";
import { useConfirmedAction } from "@/components/impersonation/use-confirmed-action";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, shortId } from "@/lib/format";
import { approveTopUpAction, rejectTopUpAction } from "@/lib/api/orders-actions";
import type { Order } from "@/lib/api/types";

export function PendingTopUpCard({ order }: { order: Order }) {
  const [pending, startTransition] = React.useTransition();
  const confirm = useConfirmedAction();
  const topUp = order.pendingTopUp;
  if (!topUp) return null;
  const topUpId = topUp.id;

  function approve() {
    startTransition(async () => {
      const result = await confirm(
        {
          title: `Approve change on order #${shortId(order.id)}`,
          description: "A payment link for the difference is sent to the customer on WhatsApp.",
          confirmLabel: "Approve and send link",
        },
        () => approveTopUpAction(order.id, topUpId),
      );
      if (!result) return;
      if (!result.ok) toast.error(result.error);
      else toast.success("Payment link sent to the customer on WhatsApp");
    });
  }

  function reject() {
    startTransition(async () => {
      const result = await confirm(
        { title: `Dismiss change request on order #${shortId(order.id)}` },
        () => rejectTopUpAction(order.id, topUpId),
      );
      if (!result) return;
      if (!result.ok) toast.error(result.error);
      else toast.success("Change request dismissed");
    });
  }

  const sentToCustomer = Boolean(topUp.paystackAuthUrl);

  return (
    <section
      aria-label="Pending change"
      className="card-warm flex flex-col gap-4 p-6"
    >
      <div>
        <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
          Pending change
        </p>
        <p className="text-foreground mt-1 text-sm">{topUp.escalationReason}</p>
      </div>

      <ul className="divide-border/70 divide-y">
        {topUp.requestedItems.map((line, i) => (
          <li
            key={`${topUpId}-${line.productId ?? line.variantId ?? line.productName}-${i}`}
            className="flex items-center gap-4 py-2 text-sm"
          >
            <span
              aria-hidden
              className="bg-muted text-muted-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums"
            >
              ×{line.quantity}
            </span>
            <span className="text-foreground min-w-0 flex-1 truncate">
              {line.productName}
            </span>
            <span className="text-foreground tabular-nums">
              {formatMoney(line.unitPrice * line.quantity, order.currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-border/70 flex justify-between border-t pt-3 text-sm font-medium">
        <span>Extra to collect</span>
        <span className="tabular-nums">
          {formatMoney(topUp.deltaAmount, order.currency)}
        </span>
      </div>

      {sentToCustomer ? (
        <p className="text-muted-foreground text-xs">
          A payment link for this amount has been sent to the customer.
        </p>
      ) : (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={approve}
            className="gap-1.5"
          >
            <Check className="size-3.5" />
            Approve &amp; send link
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={reject}
            className="gap-1.5"
          >
            <X className="size-3.5" />
            Reject
          </Button>
        </div>
      )}
    </section>
  );
}
