"use client"

import { Banknote, Minus, Plus, QrCode as QrIcon, X } from "lucide-react"
import type { CartLine } from "@/lib/till"
import { cartCount, cartTotal } from "@/lib/till"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type TillCartProps = {
  lines: CartLine[]
  currency: string
  phone: string
  onPhoneChange: (value: string) => void
  /** Rendered above the total: the pickup/delivery choice and its address. */
  fulfillment: React.ReactNode
  /** Charged on this order, already decided by the fulfillment control. */
  deliveryFee: number
  onQuantityChange: (key: string, quantity: number) => void
  onClear: () => void
  onCharge: () => void
  onCash: () => void
  busy: boolean
}

/**
 * The running order: what has been rung up, who it is for if anyone said, and
 * the two ways to take the money.
 */
export function TillCart({
  lines,
  currency,
  phone,
  onPhoneChange,
  fulfillment,
  deliveryFee,
  onQuantityChange,
  onClear,
  onCharge,
  onCash,
  busy,
}: TillCartProps) {
  const goods = cartTotal(lines)
  const total = goods + deliveryFee
  const count = cartCount(lines)
  const empty = lines.length === 0

  return (
    <div className="flex flex-col gap-3">
      {/* pr-7 keeps "Clear" out from under the sheet's close button on mobile. */}
      <div className="flex items-center justify-between pr-7">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Order{count > 0 ? ` · ${count} item${count === 1 ? "" : "s"}` : ""}
        </p>
        {!empty ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        ) : null}
      </div>

      {empty ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Tap items to start an order.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {lines.map((line) => (
            // Name on its own line, controls under it. Side by side the name
            // truncates to nothing in the narrow tablet rail, and an item a
            // worker cannot read is an item they cannot check.
            <li key={line.key} className="flex flex-col gap-1 py-1.5">
              <p className="truncate text-sm font-medium text-foreground">
                {line.name}
              </p>
              <div className="flex items-center gap-2">
                {/* At a quantity of one the unit price just repeats the line
                    total, so it only earns its space when there are several. */}
                <span className="text-xs whitespace-nowrap text-muted-foreground">
                  {line.quantity > 1
                    ? `${formatMoney(line.unitPrice, currency)} each`
                    : null}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <StepButton
                    label={`Remove one ${line.name}`}
                    onClick={() =>
                      onQuantityChange(line.key, line.quantity - 1)
                    }
                  >
                    {line.quantity === 1 ? (
                      <X className="size-3.5" />
                    ) : (
                      <Minus className="size-3.5" />
                    )}
                  </StepButton>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">
                    {line.quantity}
                  </span>
                  <StepButton
                    label={`Add one ${line.name}`}
                    onClick={() =>
                      onQuantityChange(line.key, line.quantity + 1)
                    }
                  >
                    <Plus className="size-3.5" />
                  </StepButton>
                </div>
                <span className="w-16 text-right text-sm font-semibold tabular-nums">
                  {formatMoney(line.unitPrice * line.quantity, currency)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {fulfillment}

      {/* Shown as its own line so the worker can answer "why is it 40 and not
          35" without doing arithmetic in front of the customer. */}
      {deliveryFee > 0 ? (
        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">Delivery</span>
          <span className="font-medium text-foreground tabular-nums">
            {formatMoney(deliveryFee, currency)}
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          "flex items-center justify-between",
          deliveryFee > 0 ? "" : "border-t border-border pt-3"
        )}
      >
        <span className="text-base font-bold text-foreground">Total</span>
        <span className="text-xl font-bold text-foreground tabular-nums">
          {formatMoney(total, currency)}
        </span>
      </div>

      <Input
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="Customer number (optional)"
        inputMode="tel"
        autoComplete="off"
        className="h-11"
      />

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="lg"
          disabled={empty || busy}
          onClick={onCharge}
          className="h-12 text-base"
        >
          <QrIcon className="size-4" />
          Charge {formatMoney(total, currency)}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={empty || busy}
          onClick={onCash}
          className="h-12 text-base"
        >
          <Banknote className="size-4" />
          Paid cash
        </Button>
      </div>
    </div>
  )
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
    >
      {children}
    </button>
  )
}
