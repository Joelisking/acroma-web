import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ListRow } from "@/components/shared/list-row"
import type { Product } from "@/lib/api/types"
import { formatMoney } from "@/lib/format"

type Props = { promotionId: string; items: Product[]; currency: string }

/** Items that exist only for this promotion. Created with the normal item form. */
export function PromotionItemsSection({ promotionId, items, currency }: Props) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No promo-only items. Add items customers can only order while this
          promotion runs, like a special meal.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <ListRow
              key={item.id}
              href={`/dashboard/catalog/${item.id}`}
              showChevron
              title={item.name}
              subtitle={formatMoney(item.basePrice, currency)}
            />
          ))}
        </div>
      )}
      <Button asChild variant="outline" className="gap-1.5">
        <Link href={`/dashboard/catalog/new?promotionId=${promotionId}`}>
          <Plus className="size-4" />
          Add promo-only item
        </Link>
      </Button>
    </div>
  )
}
