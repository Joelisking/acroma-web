import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { getOrder } from "@/lib/api/orders"
import { getCurrentBusiness } from "@/lib/api/business"
import { listProducts } from "@/lib/api/products"
import { ApiError } from "@/lib/api/server"
import { OrderHeader } from "@/components/orders/order-header"
import { EditOrderTrigger } from "@/components/orders/edit-order-trigger"
import { OrderItems } from "@/components/orders/order-items"
import { OrderStatusStepper } from "@/components/orders/order-status-stepper"
import { OrderStatusControl } from "@/components/orders/order-status-control"
import { PaymentLinkPanel } from "@/components/orders/payment-link-panel"
import { PendingTopUpCard } from "@/components/orders/pending-topup-card"
import { OrderQuickReplies } from "@/components/orders/order-quick-replies"
import { DeliveryAddressCard } from "@/components/orders/delivery-address-card"
import { OrderNotesCard } from "@/components/orders/order-notes-card"
import { PickupCard } from "@/components/orders/pickup-card"
import { LiveRefresh } from "@/components/conversations/live-refresh"
import { formatAppointment } from "@/lib/format-datetime"

type PageProps = { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Order · Acroma" }

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params

  const [business, order, products] = await Promise.all([
    getCurrentBusiness(),
    safeGetOrder(id),
    listProducts(),
  ])
  if (!business) return null
  if (!order) notFound()

  const isServices = business.businessType === "SERVICES"

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <OrderHeader order={order} businessType={business.businessType} />
      <EditOrderTrigger order={order} business={business} products={products} />

      <section
        className="card-warm p-6"
        aria-label="Order progress"
      >
        <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
          Progress
        </p>
        <div className="mt-5">
          <OrderStatusStepper
            status={order.status}
            paymentMethod={order.paymentMethod}
            businessType={business.businessType}
            fulfillment={order.fulfillment}
          />
        </div>
        <div className="mt-6">
          <OrderStatusControl
            orderId={order.id}
            status={order.status}
            paymentMethod={order.paymentMethod}
            businessType={business.businessType}
            fulfillment={order.fulfillment}
            totalAmount={order.totalAmount}
            currency={order.currency}
          />
        </div>
      </section>

      {order.scheduledFor ? (
        <section className="card-warm p-5" aria-label="Appointment">
          <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            Appointment
          </p>
          <p className="text-foreground mt-2 text-sm font-medium">
            {formatAppointment(order.scheduledFor)}
          </p>
          {order.amountPaid != null ? (
            <p className="text-muted-foreground mt-1 text-xs">
              Paid: {order.currency} {order.amountPaid.toFixed(2)}
            </p>
          ) : null}
        </section>
      ) : null}

      <PaymentLinkPanel order={order} />
      <PendingTopUpCard order={order} />

      {/* Quick replies are goods/food canned messages; not relevant to an
          in-person appointment. */}
      {isServices ? null : (
        <OrderQuickReplies orderId={order.id} status={order.status} />
      )}

      {/* Fulfilment card. In-person appointments need no pickup/delivery card,
          the Appointment card above carries the relevant detail. */}
      {isServices ? null : order.fulfillment === "PICKUP" ? (
        <PickupCard />
      ) : (
        <DeliveryAddressCard
          orderId={order.id}
          status={order.status}
          deliveryAddress={order.deliveryAddress}
        />
      )}

      <section aria-label="Items" className="space-y-3">
        <h2 className="text-foreground text-sm font-bold tracking-tight">Items</h2>
        <OrderItems
          items={order.items}
          currency={order.currency}
          subtotal={order.subtotal}
          discountAmount={order.discountAmount}
          total={order.totalAmount}
          discountCode={order.discount?.code ?? null}
        />
      </section>

      <OrderNotesCard orderId={order.id} notes={order.notes} />

      <LiveRefresh businessId={business.id} events={["order_updated"]} />
    </div>
  )
}

async function safeGetOrder(id: string) {
  try {
    return await getOrder(id)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}
