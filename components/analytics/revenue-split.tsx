"use client"

import { Banknote, CreditCard } from "lucide-react"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

type RevenueSplitProps = {
  paystack: number
  cash: number
  currency: string
  className?: string
}

/**
 * How the money actually arrived. The two halves are a breakdown of the total
 * shown above them, not extra figures, so they are presented as one bar rather
 * than two competing headline numbers.
 *
 * Paystack is every MoMo order, since that is the only payment method that
 * goes through a payment link. Cash is collected by hand, at the counter or on
 * delivery.
 */
export function RevenueSplit({
  paystack,
  cash,
  currency,
  className,
}: RevenueSplitProps) {
  const total = paystack + cash
  if (total <= 0) return null

  const paystackPct = Math.round((paystack / total) * 100)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className="flex h-2 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${paystackPct}% of revenue through Paystack, ${100 - paystackPct}% in cash`}
      >
        <div className="bg-brand-blue" style={{ width: `${paystackPct}%` }} />
        <div className="flex-1 bg-brand-green" />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <Row
          icon={<CreditCard className="size-3.5" />}
          tone="text-brand-blue"
          label="Paystack"
          amount={paystack}
          pct={paystackPct}
          currency={currency}
        />
        <Row
          icon={<Banknote className="size-3.5" />}
          tone="text-brand-green"
          label="Cash"
          amount={cash}
          pct={100 - paystackPct}
          currency={currency}
        />
      </div>
    </div>
  )
}

function Row({
  icon,
  tone,
  label,
  amount,
  pct,
  currency,
}: {
  icon: React.ReactNode
  tone: string
  label: string
  amount: number
  pct: number
  currency: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("flex items-center", tone)}>{icon}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground tabular-nums">
        {formatMoney(amount, currency)}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
    </div>
  )
}
