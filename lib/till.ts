import type { OrderLineInput, Product, ProductVariant } from "@/lib/api/types"
import { isSoldOutToday } from "@/lib/catalog/sold-out"

/**
 * One line in the counter cart. Catalog lines keep the resolved product and
 * variant so the tile grid can show what is already in the cart; custom lines
 * carry a name and a price the worker typed.
 */
export type CartLine = {
  /** Stable key for React and for merging repeat taps of the same item. */
  key: string
  productId: string | null
  variantId: string | null
  name: string
  unitPrice: number
  quantity: number
}

export function lineKey(
  productId: string | null,
  variantId: string | null,
  name: string
): string {
  // Custom lines key on their typed name, so ringing up two different
  // off-catalog items does not merge them into one.
  return productId ? `${productId}:${variantId ?? ""}` : `custom:${name}`
}

/** Add a line, merging into an existing identical line rather than repeating it. */
export function addLine(lines: CartLine[], next: CartLine): CartLine[] {
  const existing = lines.find((l) => l.key === next.key)
  if (!existing) return [...lines, next]
  return lines.map((l) =>
    l.key === next.key ? { ...l, quantity: l.quantity + next.quantity } : l
  )
}

/** Change a line's quantity. Dropping to zero removes it. */
export function setQuantity(
  lines: CartLine[],
  key: string,
  quantity: number
): CartLine[] {
  if (quantity < 1) return lines.filter((l) => l.key !== key)
  return lines.map((l) => (l.key === key ? { ...l, quantity } : l))
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0)
}

/** Cart lines in the shape POST /orders expects. */
export function toOrderLines(lines: CartLine[]): OrderLineInput[] {
  return lines.map((l) =>
    l.productId
      ? {
          productId: l.productId,
          ...(l.variantId ? { variantId: l.variantId } : {}),
          quantity: l.quantity,
        }
      : { customName: l.name, unitPrice: l.unitPrice, quantity: l.quantity }
  )
}

export function cartLineFromProduct(
  product: Product,
  variant?: ProductVariant
): CartLine {
  const variantId = variant?.id ?? null
  const unitPrice = variant?.priceOverride ?? product.basePrice
  const name = variant
    ? `${product.name} (${Object.values(variant.attributes).join(", ")})`
    : product.name
  return {
    key: lineKey(product.id, variantId, name),
    productId: product.id,
    variantId,
    name,
    unitPrice,
    quantity: 1,
  }
}

/**
 * What the till may sell right now: active items that are not finished for the
 * day. Sold-out items stay visible but greyed, so a worker sees "Banku is
 * finished" rather than wondering why it vanished.
 */
export function isSellable(product: Product): boolean {
  return product.isActive && !isSoldOutToday(product.soldOutAt)
}

/** Ordered, de-duplicated category list for the filter chips. */
export function categoriesOf(products: Product[]): string[] {
  const seen = new Set<string>()
  for (const p of products) {
    const c = p.category?.trim()
    if (c) seen.add(c)
  }
  return [...seen].sort((a, b) => a.localeCompare(b))
}

export function matchesSearch(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    product.name.toLowerCase().includes(q) ||
    (product.category?.toLowerCase().includes(q) ?? false)
  )
}
