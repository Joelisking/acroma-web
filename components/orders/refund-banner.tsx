"use client";

import * as React from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { formatMoney, formatPhone } from "@/lib/format";
import { recordRefundAction } from "@/lib/api/orders-actions";
import type { Order } from "@/lib/api/types";

type Props = { order: Order };

/**
 * Shown when a correction left the customer owed money. We never auto-refund —
 * this surfaces the amount + who to pay, lets the merchant record the customer's
 * mobile-money details (collected over WhatsApp), and mark the refund sent.
 */
export function RefundBanner({ order }: Props) {
  const [momoNumber, setMomoNumber] = React.useState(
    order.refundMomoNumber ?? "",
  );
  const [momoName, setMomoName] = React.useState(order.refundMomoName ?? "");
  const [pending, startTransition] = React.useTransition();

  if (order.refundedAt) {
    return (
      <section className="card-warm p-5" aria-label="Refund">
        <p className="text-brand-green text-xs font-bold tracking-widest uppercase">
          Refund sent
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Marked refunded on {new Date(order.refundedAt).toLocaleDateString()}.
        </p>
      </section>
    );
  }

  if (order.refundDueAmount <= 0) return null;

  const detailsChanged =
    momoNumber.trim() !== (order.refundMomoNumber ?? "") ||
    momoName.trim() !== (order.refundMomoName ?? "");

  function save(markRefunded: boolean) {
    startTransition(async () => {
      const result = await recordRefundAction(order.id, {
        momoNumber: momoNumber.trim(),
        momoName: momoName.trim(),
        ...(markRefunded ? { markAs: "refunded" as const } : {}),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(markRefunded ? "Marked refunded" : "Details saved");
    });
  }

  const customer =
    order.customerName?.trim() || formatPhone(order.customerPhone);

  return (
    <section
      className="border-brand-orange/30 bg-brand-orange-soft rounded-xl border p-5"
      aria-label="Refund due"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-brand-orange text-xs font-bold tracking-widest uppercase">
            Refund due
          </p>
          <p className="text-brand-navy mt-1 text-2xl font-bold tabular-nums">
            {formatMoney(order.refundDueAmount, order.currency)}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Owed to {customer} · {formatPhone(order.customerPhone)}
          </p>
        </div>
        <CopyButton
          value={order.customerPhone}
          label="Copy customer number"
        />
      </div>

      <p className="text-muted-foreground mt-4 text-sm">
        Send this back manually. Ask the customer for the mobile money number and
        the name on it, then record them here.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="refund-momo-number">MoMo number</Label>
          <Input
            id="refund-momo-number"
            inputMode="tel"
            value={momoNumber}
            onChange={(e) => setMomoNumber(e.target.value)}
            placeholder="024 000 0000"
            disabled={pending}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="refund-momo-name">Name on the number</Label>
          <Input
            id="refund-momo-name"
            value={momoName}
            onChange={(e) => setMomoName(e.target.value)}
            placeholder="Account name"
            disabled={pending}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending || !detailsChanged}
          onClick={() => save(false)}
        >
          Save details
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => save(true)}
        >
          <RotateCcw className="size-4" /> Mark refunded
        </Button>
      </div>
    </section>
  );
}
