import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-9 w-72 rounded-full" />
      </header>
      <section className="border-border/70 bg-card overflow-hidden rounded-2xl border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border-border/60 flex items-center gap-4 border-b px-4 py-4 last:border-b-0"
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
