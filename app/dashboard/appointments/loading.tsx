import { Skeleton } from "@/components/ui/skeleton"
export default function Loading() {
  return (
    <div role="status" aria-label="Loading calendar" className="space-y-6">
      <span className="sr-only">Loading appointments…</span>
      <Skeleton className="h-9 w-56" />
      <div className="rounded-2xl border p-4">
        <Skeleton className="mb-6 h-16 w-full" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => (
            <Skeleton key={i} className="h-20 sm:h-28" />
          ))}
        </div>
      </div>
    </div>
  )
}
