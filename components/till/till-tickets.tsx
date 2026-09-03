"use client"

import { Check, Loader2 } from "lucide-react"
import type { Order } from "@/lib/api/types"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export type Ticket = {
  order: Order
  /** Short human reference, so a worker can say "the ninety cedi one". */
  label: string
}

type TillTicketsProps = {
  tickets: Ticket[]
  onOpen: (ticket: Ticket) => void
}

const PAID_STATUSES = new Set([
  "PAID",
  "PROCESSING",
  "PREPARING",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
])

export function isPaid(order: Order): boolean {
  return PAID_STATUSES.has(order.status)
}

/**
 * Orders charged but not yet cleared off the counter. They park here so one
 * customer taking a minute to find their PIN does not stall the queue behind
 * them, and they turn green on their own when Paystack confirms.
 */
export function TillTickets({ tickets, onOpen }: TillTicketsProps) {
  if (tickets.length === 0) return null

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {tickets.map((ticket) => {
        const paid = isPaid(ticket.order)
        return (
          <button
            key={ticket.order.id}
            type="button"
            onClick={() => onOpen(ticket)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
              paid
                ? "border-brand-green bg-brand-green-soft text-brand-green"
                : "border-brand-orange bg-brand-orange-soft text-brand-orange"
            )}
          >
            {paid ? (
              <Check className="size-3.5" />
            ) : (
              <Loader2 className="size-3.5 animate-spin" />
            )}
            <span>{ticket.label}</span>
            <span className="tabular-nums">
              {formatMoney(ticket.order.totalAmount, ticket.order.currency)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
