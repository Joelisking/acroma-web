"use client"

import * as React from "react"
import { Plus, Search } from "lucide-react"
import type { Product } from "@/lib/api/types"
import { formatMoney } from "@/lib/format"
import { isSoldOutToday } from "@/lib/catalog/sold-out"
import { categoriesOf, matchesSearch } from "@/lib/till"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type TillCatalogProps = {
  products: Product[]
  currency: string
  onPick: (product: Product) => void
  onCustom: () => void
}

/**
 * The item picker. Search sits at the top at every width because it is the
 * only thing that scales past a screenful of tiles; the category chips and the
 * grid below it are what a worker with a small, familiar menu actually uses.
 */
export function TillCatalog({
  products,
  currency,
  onPick,
  onCustom,
}: TillCatalogProps) {
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<string | null>(null)
  const categories = React.useMemo(() => categoriesOf(products), [products])

  const visible = React.useMemo(
    () =>
      products
        .filter((p) => p.isActive)
        .filter((p) => !category || p.category === category)
        .filter((p) => matchesSearch(p, query)),
    [products, category, query]
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items"
          className="h-11 pl-9"
          autoComplete="off"
        />
      </div>

      {categories.length > 0 ? (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <CategoryChip
            label="All"
            active={category === null}
            onClick={() => setCategory(null)}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c}
              label={c}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((product) => (
          <ProductTile
            key={product.id}
            product={product}
            currency={currency}
            onPick={onPick}
          />
        ))}
        <button
          type="button"
          onClick={onCustom}
          className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-brand-orange hover:text-brand-orange"
        >
          <Plus className="size-4" />
          Custom
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nothing matches &ldquo;{query}&rdquo;.
        </p>
      ) : null}
    </div>
  )
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-brand-orange text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  )
}

function ProductTile({
  product,
  currency,
  onPick,
}: {
  product: Product
  currency: string
  onPick: (p: Product) => void
}) {
  const soldOut = isSoldOutToday(product.soldOutAt)
  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => onPick(product)}
      className={cn(
        "card-warm flex min-h-20 flex-col justify-between gap-1 p-3 text-left transition-transform",
        soldOut
          ? "cursor-not-allowed opacity-40"
          : "hover:border-brand-orange active:scale-[0.98]"
      )}
    >
      <span className="line-clamp-2 text-sm font-semibold text-foreground">
        {product.name}
      </span>
      <span
        className={cn(
          "text-sm font-bold",
          soldOut ? "text-muted-foreground" : "text-brand-orange"
        )}
      >
        {soldOut ? "Sold out" : formatMoney(product.basePrice, currency)}
      </span>
    </button>
  )
}
