import { TriangleAlert } from "lucide-react"

/**
 * Sellable items flagged as having options but with none set up ring up at
 * the base price. Said out loud rather than swallowed, so a worker knows.
 */
export function TillVariantsWarning({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-2xl border border-brand-orange/25 bg-brand-orange-soft p-3 text-sm text-brand-navy/80"
    >
      <TriangleAlert
        className="mt-0.5 size-4 shrink-0 text-brand-orange"
        strokeWidth={1.75}
      />
      <span>
        {count} item{count === 1 ? "" : "s"} {count === 1 ? "has" : "have"} no
        options set up, so {count === 1 ? "it" : "they"}&apos;ll ring up at the
        base price. Check the catalog if that&apos;s not right.
      </span>
    </div>
  )
}
