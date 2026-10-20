import Link from "next/link"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { BadgePercent, Plus } from "lucide-react"
import { getCurrentBusiness } from "@/lib/api/business"
import { listPromotions } from "@/lib/api/promotions"
import { redirectStaffHome } from "@/lib/api/owner-only"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { PromotionRow } from "@/components/promotions/promotion-row"

export const metadata: Metadata = { title: "Promotions · Acroma" }

export default async function PromotionsPage() {
  await redirectStaffHome()
  const business = await getCurrentBusiness()
  if (!business) return null
  if (business.businessType !== "FOOD_BEVERAGES") redirect("/dashboard")
  const promotions = await listPromotions()

  const newButton = (
    <Button asChild size="sm" className="h-9 gap-1.5">
      <Link href="/dashboard/promotions/new">
        <Plus className="size-4" />
        New promotion
      </Link>
    </Button>
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Promotions"
        description="Run promo prices and promo-only items for a while. Your regular prices stay as they are."
        actions={newButton}
      />
      {promotions.length === 0 ? (
        <EmptyState
          icon={BadgePercent}
          title="No promotions yet."
          description="Set promo prices or add promo-only items, then switch it on or schedule it."
          action={newButton}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {promotions.map((p) => (
            <PromotionRow key={p.id} promotion={p} />
          ))}
        </div>
      )}
    </div>
  )
}
