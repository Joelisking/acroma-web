import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { ChevronLeft } from "lucide-react"
import { getCurrentBusiness } from "@/lib/api/business"
import { listProducts } from "@/lib/api/products"
import { getPromotion } from "@/lib/api/promotions"
import { redirectStaffHome } from "@/lib/api/owner-only"
import { ApiError } from "@/lib/api/server"
import { StatusPill } from "@/components/shared/status-pill"
import { ArchivePromotionButton } from "@/components/promotions/archive-promotion-button"
import { PromotionForm } from "@/components/promotions/promotion-form"
import { PromotionItemsSection } from "@/components/promotions/promotion-items-section"
import { PromotionMenuSection } from "@/components/promotions/promotion-menu-section"
import { PromotionPricesEditor } from "@/components/promotions/promotion-prices-editor"
import { PromotionSection } from "@/components/promotions/promotion-section"
import { PromotionSwitch } from "@/components/promotions/promotion-switch"
import {
  hasEndedByDate,
  promotionStatusPill,
  promotionWindow,
} from "@/lib/promotions"

type PageProps = { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Promotion · Acroma" }

export default async function PromotionPage({ params }: PageProps) {
  await redirectStaffHome()
  const { id } = await params
  const business = await getCurrentBusiness()
  if (!business) return null
  if (business.businessType !== "FOOD_BEVERAGES") redirect("/dashboard")

  let promotion
  try {
    promotion = await getPromotion(id)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }
  const [catalog, items] = await Promise.all([
    listProducts(),
    listProducts({ promotionId: id }),
  ])
  const status = promotionStatusPill(promotion.status)
  const window = promotionWindow(promotion)
  const endedByDate = hasEndedByDate(promotion)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <Link
          href="/dashboard/promotions"
          className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Promotions
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {promotion.name}
            </h1>
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
          </div>
          <div className="flex items-center gap-2">
            <PromotionSwitch promotion={promotion} />
            {promotion.status !== "LIVE" && promotion.status !== "SCHEDULED" ? (
              <ArchivePromotionButton id={promotion.id} name={promotion.name} />
            ) : null}
          </div>
        </div>
        {window ? (
          <p className="text-sm text-muted-foreground">{window}</p>
        ) : null}
        {endedByDate ? (
          <p className="text-sm text-muted-foreground">
            This ended on its end date. Move or clear the end date below to run
            it again.
          </p>
        ) : null}
      </header>

      <PromotionSection
        title="Details"
        description="Your regular prices are never changed by a promotion."
      >
        <PromotionForm existing={promotion} />
      </PromotionSection>
      <PromotionSection
        title="Promo prices"
        description="Existing menu items that sell at a promo price while this runs."
      >
        <PromotionPricesEditor
          promotionId={promotion.id}
          initial={promotion.prices}
          products={catalog}
          currency={business.currency}
        />
      </PromotionSection>
      <PromotionSection
        title="Promo-only items"
        description="Only orderable while this promotion runs. Afterwards customers are told it has ended."
      >
        <PromotionItemsSection
          promotionId={promotion.id}
          items={items}
          currency={business.currency}
        />
      </PromotionSection>
      <PromotionSection
        title="Promo menu"
        description={
          promotion.menuMode === "REPLACES"
            ? "Sent instead of your regular menu while this runs."
            : "Sent after your regular menu when customers ask what you have."
        }
      >
        <PromotionMenuSection promotion={promotion} />
      </PromotionSection>
    </div>
  )
}
