"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Product } from "@/lib/api/types"
import { formatMoney } from "@/lib/format"
import { variantLabel } from "@/lib/promotions"

export type PriceRowState = {
  key: string
  productId: string
  variantId: string | null
  price: string
}

const ALL = "__all__"

type Props = {
  row: PriceRowState
  products: Product[]
  currency: string
  disabled?: boolean
  onChange: (row: PriceRowState) => void
  onRemove: () => void
}

/** Regular price of the item (or option) this row reprices. */
export function regularPriceOf(products: Product[], row: PriceRowState) {
  const product = products.find((p) => p.id === row.productId)
  if (!product) return null
  const variant = product.variants?.find((v) => v.id === row.variantId)
  return variant?.priceOverride ?? product.basePrice
}

export function PromotionPriceRow({
  row,
  products,
  currency,
  disabled,
  onChange,
  onRemove,
}: Props) {
  const product = products.find((p) => p.id === row.productId)
  const variants = product?.hasVariants ? (product.variants ?? []) : []
  const regular = regularPriceOf(products, row)
  const price = Number(row.price)
  const notLower = row.price !== "" && regular !== null && price >= regular

  return (
    <div className="space-y-2 rounded-xl border border-border/70 p-3">
      <div className="flex items-start gap-2">
        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <Select
            value={row.productId || undefined}
            onValueChange={(productId) =>
              onChange({ ...row, productId, variantId: null })
            }
            disabled={disabled}
          >
            <SelectTrigger aria-label="Item" className="w-full">
              <SelectValue placeholder="Choose an item" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {variants.length > 0 ? (
            <Select
              value={row.variantId ?? ALL}
              onValueChange={(v) =>
                onChange({ ...row, variantId: v === ALL ? null : v })
              }
              disabled={disabled}
            >
              <SelectTrigger aria-label="Option" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All options</SelectItem>
                {variants.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {variantLabel(v.attributes)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove promo price"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={row.price}
          onChange={(e) => onChange({ ...row, price: e.target.value })}
          placeholder="Promo price"
          aria-label="Promo price"
          disabled={disabled}
          className="w-36"
        />
        {regular !== null ? (
          <span className="text-xs text-muted-foreground">
            Regular {formatMoney(regular, currency)}
          </span>
        ) : null}
      </div>
      {notLower ? (
        <p className="text-xs text-brand-orange">
          This isn&apos;t lower than the regular price.
        </p>
      ) : null}
    </div>
  )
}
