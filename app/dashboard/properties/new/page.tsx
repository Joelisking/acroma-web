import type { Metadata } from "next"
import { requireEstate } from "@/lib/api/real-estate"
import { PropertyForm } from "@/components/real-estate/property-form"
import { PageHeader } from "@/components/shared/page-header"
export const metadata: Metadata = { title: "Add property · Acroma" }
export default async function NewPropertyPage() {
  const business = await requireEstate()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Add a property"
        description="Only include details and photos your agency can verify."
      />
      <PropertyForm currency={business.currency} />
    </div>
  )
}
