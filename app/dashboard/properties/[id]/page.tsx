import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProperties, requireEstate } from "@/lib/api/real-estate"
import { PropertyForm } from "@/components/real-estate/property-form"
import { PageHeader } from "@/components/shared/page-header"
export const metadata: Metadata = { title: "Edit property · Acroma" }
export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const business = await requireEstate()
  const { id } = await params
  const property = (await listProperties()).find((p) => p.id === id)
  if (!property) notFound()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit property"
        description="Sold, under offer and archived properties are excluded from buyer search."
      />
      <PropertyForm property={property} currency={business.currency} />
    </div>
  )
}
