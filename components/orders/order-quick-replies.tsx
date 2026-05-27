"use client";

import * as React from "react";
import { toast } from "sonner";
import { Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  delayOrderAction,
  markOrderSoldOutAction,
} from "@/lib/api/orders-actions";
import type { Order } from "@/lib/api/types";

// Statuses where neither quick reply makes sense. A cancelled order can't be
// "sold out" any more than it already is; a delivered one is done; a failed
// payment hasn't gone to the kitchen.
const HIDE_FOR: Order["status"][] = ["CANCELLED", "DELIVERED", "PAYMENT_FAILED"];

type Props = {
  orderId: string;
  status: Order["status"];
};

export function OrderQuickReplies({ orderId, status }: Props) {
  const [pendingDelay, startDelay] = React.useTransition();
  const [pendingSoldOut, startSoldOut] = React.useTransition();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  if (HIDE_FOR.includes(status)) return null;

  function fireDelay() {
    startDelay(async () => {
      const result = await delayOrderAction(orderId);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Customer notified");
      }
    });
  }

  function fireSoldOut() {
    setConfirmOpen(false);
    startSoldOut(async () => {
      const result = await markOrderSoldOutAction(orderId);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Order cancelled, customer notified");
      }
    });
  }

  return (
    <section
      aria-label="Quick replies"
      className="border-border/70 bg-card flex flex-col gap-4 rounded-2xl border p-6"
    >
      <div>
        <p className="eyebrow text-muted-foreground">Quick replies</p>
        <p className="text-foreground mt-1 text-sm">
          One-tap messages for the moments food orders go sideways.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pendingDelay}
          onClick={fireDelay}
          className="gap-1.5"
        >
          <Clock className="size-3.5" />
          Running a few minutes late
        </Button>

        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={pendingSoldOut}
          onClick={() => setConfirmOpen(true)}
          className="gap-1.5"
        >
          <XCircle className="size-3.5" />
          Sold out, cancel order
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark sold out and cancel?</DialogTitle>
            <DialogDescription>
              This cancels the order, marks every item on it as sold out for
              the rest of today, and sends the customer an apology. For paid
              orders you will still need to process the refund manually in
              Paystack.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="sm">
                Keep order
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={fireSoldOut}
              disabled={pendingSoldOut}
            >
              Yes, sold out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
