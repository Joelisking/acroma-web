"use client"

import { Bike, ShoppingBag } from "lucide-react"
import type { OrderFulfillment } from "@/lib/api/types"
import { Input } from "@/components/ui/input"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

type TillFulfillmentProps = {
  value: OrderFulfillment
  onChange: (next: OrderFulfillment) => void
  address: string
  onAddressChange: (next: string) => void
  deliveryFee: number
  currency: string
  /** True once the worker has tried to charge without an address. */
  showAddressError: boolean
}

/**
 * Pickup or delivery at the counter. Delivery reveals the address, which is
 * required: a paid delivery order with nowhere to go is the kind of problem
 * that only surfaces when someone is already waiting for food.
 */
export function TillFulfillment({
  value,
  onChange,
  address,
  onAddressChange,
  deliveryFee,
  currency,
  showAddressError,
}: TillFulfillmentProps) {
  const isDelivery = value === "DELIVERY"
  const missingAddress = isDelivery && address.trim().length === 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 rounded-full bg-muted p-1">
        <Option
          active={!isDelivery}
          onClick={() => onChange("PICKUP")}
          icon={<ShoppingBag className="size-3.5" />}
          label="Pickup"
        />
        <Option
          active={isDelivery}
          onClick={() => onChange("DELIVERY")}
          icon={<Bike className="size-3.5" />}
          label={
            deliveryFee > 0
              ? `Delivery +${formatMoney(deliveryFee, currency)}`
              : "Delivery"
          }
        />
      </div>

      {isDelivery ? (
        <>
          <Input
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Where is it going?"
            autoComplete="off"
            className="h-11"
            aria-invalid={showAddressError && missingAddress}
            aria-label="Delivery address"
          />
          {showAddressError && missingAddress ? (
            <p className="text-xs text-destructive" role="alert">
              Add where it is going before charging.
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function Option({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  )
}
