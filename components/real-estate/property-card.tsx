import Image from "next/image"
import Link from "next/link"
import { Building2, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { estateMoney, type Listing } from "@/lib/real-estate"

export function PropertyCard({ property }: { property: Listing }) {
  return (
    <Link
      href={`/dashboard/properties/${property.id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {property.imageUrls[0] ? (
          <Image
            src={property.imageUrls[0]}
            alt={property.title}
            fill
            unoptimized
            className="object-cover motion-safe:transition-transform motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="size-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <Badge variant="secondary">
          {property.status.toLowerCase().replaceAll("_", " ")}
        </Badge>
        <h2 className="text-lg font-semibold">{property.title}</h2>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          {property.location}
        </p>
        <p className="font-semibold">
          {estateMoney(property.askingPrice, property.currency)}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            asking price
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          {property.propertyType}
          {property.bedrooms === null ? "" : ` · ${property.bedrooms} bedrooms`}
          {property.bathrooms === null
            ? ""
            : ` · ${property.bathrooms} bathrooms`}
        </p>
      </div>
    </Link>
  )
}
