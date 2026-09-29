import Link from "next/link"
import type { Metadata } from "next"
import { listProperties, requireEstate } from "@/lib/api/real-estate"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { PropertyCard } from "@/components/real-estate/property-card"
import { PropertySearch } from "@/components/real-estate/property-search"
import { LiveRefresh } from "@/components/conversations/live-refresh"
export const metadata: Metadata = { title: "Properties · Acroma" }

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    location?: string
    maxBudget?: string
    currency?: string
  }>
}) {
  const business = await requireEstate()
  const properties = await listProperties(await searchParams)
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Properties for sale"
        description="Help buyers find their next property and arrange a viewing."
        actions={
          <Button asChild>
            <Link href="/dashboard/properties/new">Add property</Link>
          </Button>
        }
      />
      <PropertySearch currency={business.currency} />
      {properties.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          No matching properties. Add a listing or adjust the search.
        </div>
      )}
      <LiveRefresh businessId={business.id} events={["estate_updated"]} />
    </div>
  )
}
