"use client"

import type { PromotionMenuMode } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const OPTIONS: { value: PromotionMenuMode; title: string; body: string }[] = [
  {
    value: "ALONGSIDE",
    title: "Show alongside regular menu",
    body: "Customers get your regular menu plus the promo menu. Everything can be ordered.",
  },
  {
    value: "REPLACES",
    title: "Replace regular menu during promo",
    body: "Customers only get the promo menu and can only order promo items until it ends.",
  },
]

type Props = {
  value: PromotionMenuMode
  onChange: (value: PromotionMenuMode) => void
  disabled?: boolean
}

export function MenuModePicker({ value, onChange, disabled }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Menu"
      className="grid gap-2 sm:grid-cols-2"
    >
      {OPTIONS.map((o) => {
        const selected = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-xl border p-3 text-left transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              selected
                ? "border-brand-orange bg-brand-orange-soft"
                : "border-border/70 hover:bg-muted/50"
            )}
          >
            <span className="block text-sm font-semibold text-foreground">
              {o.title}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {o.body}
            </span>
          </button>
        )
      })}
    </div>
  )
}
