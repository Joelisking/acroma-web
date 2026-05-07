import { Skeleton } from "@/components/ui/skeleton";

export function ConversationListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <section className="border-border/70 bg-card overflow-hidden rounded-2xl border">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="border-border/60 flex items-center gap-3 border-b px-3 py-3 last:border-b-0"
        >
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </section>
  );
}
