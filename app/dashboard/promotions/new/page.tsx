import Link from "next/link"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ChevronLeft } from "lucide-react"
import { getCurrentBusiness } from "@/lib/api/business"
import { redirectStaffHome } from "@/lib/api/owner-only"
import { PromotionForm } from "@/components/promotions/promotion-form"

export const metadata: Metadata = { title: "New promotion · Acroma" }

export default async function NewPromotionPage() {
  await redirectStaffHome()
  const business = await getCurrentBusiness()
  if (business?.businessType !== "FOOD_BEVERAGES") redirect("/dashboard")

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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          New promotion
        </h1>
        <p className="text-sm text-muted-foreground">
          Start with the basics. You&apos;ll add promo prices, promo-only items
          and a promo menu next.
        </p>
      </header>
      <PromotionForm />
    </div>
  )
}
