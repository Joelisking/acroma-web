"use client"

import * as React from "react"
import type { Product, ProductVariant } from "@/lib/api/types"
import { formatMoney } from "@/lib/format"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type VariantDialogProps = {
  product: Product | null
  variants: ProductVariant[]
  currency: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (variant: ProductVariant) => void
}

/** Which size, which colour. Tapping a variant rings it up and closes. */
export function VariantDialog({
  product,
  variants,
  currency,
  open,
  onOpenChange,
  onPick,
}: VariantDialogProps) {
  if (!product) return null
  const available = variants.filter((v) => v.isActive)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        {available.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No options are available for this item right now.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {available.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => onPick(variant)}
                className="card-warm flex items-center justify-between p-3 text-left transition-colors hover:border-brand-orange"
              >
                <span className="text-sm font-medium text-foreground">
                  {Object.values(variant.attributes).join(", ")}
                </span>
                <span className="text-sm font-bold text-brand-orange">
                  {formatMoney(
                    variant.priceOverride ?? product.basePrice,
                    currency
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
