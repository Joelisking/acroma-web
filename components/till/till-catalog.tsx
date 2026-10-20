"use client"

import * as React from "react"
import { Plus, Search } from "lucide-react"
import type { Product, Promotion } from "@/lib/api/types"
import { categoriesOf, isPromoItem, matchesSearch } from "@/lib/till"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { TillProductTile } from "./till-product-tile"

type TillCatalogProps = {
  products: Product[]
  currency: string
  onPick: (product: Product) => void
  onCustom: () => void
  /** The live promotion: its items are pinned first; REPLACES hides the rest by default. */
  promotion?: Pick<Promotion, "name" | "menuMode"> | null
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
  promotion,
}: TillCatalogProps) {
  const [query, setQuery] = React.useState("")
  // Staff can still ring up a regular item during a REPLACES promotion.
  const [showFullMenu, setShowFullMenu] = React.useState(false)
  const promoOnlyMenu = promotion?.menuMode === "REPLACES" && !showFullMenu
  const [category, setCategory] = React.useState<string | null>(null)
  const categories = React.useMemo(() => categoriesOf(products), [products])

  const visible = React.useMemo(
    () =>
      products
        .filter((p) => p.isActive)
        .filter((p) => !category || p.category === category)
        .filter((p) => matchesSearch(p, query))
        .filter((p) => !promoOnlyMenu || isPromoItem(p)),
    [products, category, query, promoOnlyMenu]
  )
  const promoTiles = promotion ? visible.filter(isPromoItem) : []
  const regularTiles = promotion
    ? visible.filter((p) => !isPromoItem(p))
    : visible
  const tile = (product: Product) => (
    <TillProductTile
      key={product.id}
      product={product}
      currency={currency}
      onPick={onPick}
    />
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

      {promotion ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            Promo · {promotion.name}
          </p>
          {promotion.menuMode === "REPLACES" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFullMenu((v) => !v)}
            >
              {showFullMenu ? "Promo items only" : "Show full menu"}
            </Button>
          ) : null}
        </div>
      ) : null}
      {promoTiles.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {promoTiles.map(tile)}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {regularTiles.map(tile)}
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
