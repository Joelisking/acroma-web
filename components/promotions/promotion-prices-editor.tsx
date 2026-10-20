"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { setPromotionPricesAction } from "@/lib/api/promotions-actions"
import type { Product, PromotionPrice } from "@/lib/api/types"
import { PromotionPriceRow, type PriceRowState } from "./promotion-price-row"

type Props = {
  promotionId: string
  initial: PromotionPrice[]
  products: Product[]
  currency: string
}

let seq = 0
const newKey = () => `row-${++seq}`

/** Promo prices on existing items. Saves the whole set at once. */
export function PromotionPricesEditor({
  promotionId,
  initial,
  products,
  currency,
}: Props) {
  const router = useRouter()
  const [saving, startSaving] = React.useTransition()
  const [rows, setRows] = React.useState<PriceRowState[]>(() =>
    initial.map((p) => ({
      key: newKey(),
      productId: p.productId,
      variantId: p.variantId,
      price: String(p.price),
    }))
  )

  function update(key: string, next: PriceRowState) {
    setRows((prev) => prev.map((r) => (r.key === key ? next : r)))
  }

  function save() {
    const filled = rows.filter((r) => r.productId)
    const invalid = filled.find(
      (r) => r.price === "" || !(Number(r.price) >= 0)
    )
    if (invalid) {
      toast.error("Every promo price needs a price of 0 or more")
      return
    }
    startSaving(async () => {
      const result = await setPromotionPricesAction(
        promotionId,
        filled.map((r) => ({
          productId: r.productId,
          variantId: r.variantId,
          price: Number(r.price),
        }))
      )
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Promo prices saved")
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No promo prices yet. Add an item from your menu and give it a promo
          price.
        </p>
      ) : (
        rows.map((row) => (
          <PromotionPriceRow
            key={row.key}
            row={row}
            products={products}
            currency={currency}
            disabled={saving}
            onChange={(next) => update(row.key, next)}
            onRemove={() =>
              setRows((prev) => prev.filter((r) => r.key !== row.key))
            }
          />
        ))
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          disabled={saving}
          onClick={() =>
            setRows((prev) => [
              ...prev,
              { key: newKey(), productId: "", variantId: null, price: "" },
            ])
          }
        >
          <Plus className="size-4" />
          Add promo price
        </Button>
        <Button type="button" onClick={save} disabled={saving}>
          Save promo prices
        </Button>
      </div>
    </div>
  )
}
