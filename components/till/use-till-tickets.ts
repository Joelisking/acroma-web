"use client"

import * as React from "react"
import type { Order } from "@/lib/api/types"
import { useAcromaSocket } from "@/hooks/use-acroma-socket"
import type { Ticket } from "./till-tickets"

type OrderUpdatedPayload = { order?: Order }

/**
 * The strip of orders charged but not yet cleared off the counter.
 *
 * Tickets flip to paid off the same `order_updated` broadcast the owner's board
 * listens to, so nobody has to refresh or ask the customer whether it went
 * through. A cancelled order drops off entirely.
 */
export function useTillTickets(businessId: string, initial: Ticket[] = []) {
  // Seeded from the server with today's still-unpaid counter orders, so a
  // reloaded tablet does not lose sight of who has paid and who has not.
  const [tickets, setTickets] = React.useState<Ticket[]>(initial)

  const add = React.useCallback((order: Order) => {
    setTickets((current) => [
      { order, label: `#${order.id.slice(0, 4).toUpperCase()}` },
      ...current.filter((t) => t.order.id !== order.id),
    ])
  }, [])

  const remove = React.useCallback((orderId: string) => {
    setTickets((current) => current.filter((t) => t.order.id !== orderId))
  }, [])

  const clear = React.useCallback(() => setTickets([]), [])

  const handlers = React.useMemo(
    () => ({
      order_updated: (payload: unknown) => {
        const order = (payload as OrderUpdatedPayload)?.order
        if (!order?.id) return
        setTickets((current) => {
          // Only orders this till put on the strip. A WhatsApp order landing on
          // the owner's board has no business appearing at the counter.
          if (!current.some((t) => t.order.id === order.id)) return current
          if (order.status === "CANCELLED") {
            return current.filter((t) => t.order.id !== order.id)
          }
          return current.map((t) =>
            t.order.id === order.id ? { ...t, order } : t
          )
        })
      },
    }),
    []
  )

  useAcromaSocket(businessId, handlers)

  return { tickets, add, remove, clear }
}
