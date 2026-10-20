import { BadgePercent } from "lucide-react"
import { ListRow } from "@/components/shared/list-row"
import { StatusPill } from "@/components/shared/status-pill"
import type { Promotion } from "@/lib/api/types"
import { promotionStatusPill, promotionWindow } from "@/lib/promotions"

export function PromotionRow({ promotion }: { promotion: Promotion }) {
  const status = promotionStatusPill(promotion.status)
  const mode =
    promotion.menuMode === "REPLACES"
      ? "Replaces regular menu"
      : "Alongside regular menu"
  const window = promotionWindow(promotion)
  return (
    <ListRow
      className="card-warm"
      href={`/dashboard/promotions/${promotion.id}`}
      showChevron
      leading={
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-orange-soft text-brand-orange">
          <BadgePercent className="size-5" strokeWidth={2} />
        </span>
      }
      title={
        <span className="flex items-center gap-2">
          <span className="truncate">{promotion.name}</span>
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
        </span>
      }
      subtitle={window ? `${mode} · ${window}` : mode}
    />
  )
}
