"use client"

import * as React from "react"
import { Check, Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import type { Order } from "@/lib/api/types"
import { formatMoney, formatPhone } from "@/lib/format"
import { sendPaymentLinkAction } from "@/lib/api/till-actions"
import { updateOrderStatusAction } from "@/lib/api/orders-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { QrCode } from "./qr-code"
import { isPaid } from "./till-tickets"
import { isWalkIn } from "@/lib/walk-in"

// WhatsApp will not carry a free-form message to a customer who has not
// written to the business in the last 24 hours, which is most people standing
// at a counter. Saying so plainly beats a generic failure, because "ask them
// to message you first" is a thing the worker can actually do.
const REFUSAL_COPY = {
  OUT_OF_WINDOW:
    "They haven't messaged you in the last 24 hours, so WhatsApp won't deliver it. Ask them to scan the QR.",
  OPTED_OUT:
    "They asked to stop receiving messages. Ask them to scan the QR.",
} as const

type TillChargeDialogProps = {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Park the order and clear the till for the next customer. */
  onNext: () => void
  onCancelled: (order: Order) => void
}

/**
 * What the customer looks at while they pay, and what the worker does if they
 * would rather have the link on WhatsApp or the customer walks off.
 */
export function TillChargeDialog({
  order,
  open,
  onOpenChange,
  onNext,
  onCancelled,
}: TillChargeDialogProps) {
  const [busy, setBusy] = React.useState(false)
  if (!order) return null

  const paid = isPaid(order)
  const canSend = !isWalkIn(order.customerPhone) && !!order.paystackAuthUrl

  async function handleSend() {
    if (!order) return
    setBusy(true)
    const res = await sendPaymentLinkAction(order.id)
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    if (!res.data.ok) {
      // Not a failure to fix, just a route that is closed for this customer,
      // and the QR is already on screen. Say which route and why, so the
      // worker knows whether asking the customer to message first would help.
      if (res.data.reason === "UNREACHABLE") {
        toast.error("Couldn't reach them on WhatsApp. Ask them to scan the QR.")
      } else {
        toast.info(REFUSAL_COPY[res.data.reason])
      }
      return
    }
    toast.success("Link sent on WhatsApp.")
  }

  async function handleCancel() {
    if (!order) return
    setBusy(true)
    const res = await updateOrderStatusAction(order.id, "CANCELLED")
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    onCancelled(res.data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl tabular-nums">
            {formatMoney(order.totalAmount, order.currency)}
          </DialogTitle>
          <DialogDescription className="text-center">
            {paid
              ? "Payment received."
              : order.paystackAuthUrl
                ? "Ask the customer to scan this to pay."
                : "This order has no payment link."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {paid ? (
            <div className="flex size-52 flex-col items-center justify-center gap-2 rounded-2xl bg-brand-green-soft text-brand-green">
              <Check className="size-12" />
              <span className="text-sm font-semibold">Paid</span>
            </div>
          ) : order.paystackAuthUrl ? (
            <>
              <div className="rounded-2xl bg-white p-3">
                <QrCode value={order.paystackAuthUrl} />
              </div>
              <p className="flex items-center gap-2 text-sm font-semibold text-brand-orange">
                <Loader2 className="size-3.5 animate-spin" />
                Waiting for payment
              </p>
            </>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          {!paid && canSend ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={handleSend}
              >
                <Send className="size-4" />
                Send link on WhatsApp
              </Button>
              {/* Show the number the message will actually go to. The backend
                  rewrites a locally-typed number into international form, so
                  this is a worker's chance to catch a wrong digit before the
                  customer walks away. */}
              <p className="text-center text-xs text-muted-foreground tabular-nums">
                to {formatPhone(order.customerPhone)}
              </p>
            </>
          ) : null}
          <Button
            type="button"
            onClick={paid ? () => onOpenChange(false) : onNext}
          >
            {paid ? "Done" : "Next customer"}
          </Button>
          {!paid ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={handleCancel}
              className="text-muted-foreground"
            >
              Cancel order
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
