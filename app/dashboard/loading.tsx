import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">
      {/* Mobile greeting placeholder */}
      <div className="space-y-2 lg:hidden">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-48" />
      </div>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card-warm flex flex-col gap-3 p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </section>

      {/* Recent activity list */}
      <section className="card-warm overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border-border/60 flex items-center gap-4 border-b px-4 py-4 last:border-b-0"
          >
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </section>
    </div>
  );
}
