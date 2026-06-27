import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-paper fixed inset-0 z-30 flex flex-col md:static md:inset-auto md:z-auto md:h-full md:bg-transparent">
      <div className="border-border flex items-center gap-3 border-b px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:pt-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="size-9 rounded-lg" />
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 py-4 sm:px-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className={
              i % 2 === 0
                ? "h-12 w-2/3 rounded-2xl"
                : "h-12 w-1/2 self-end rounded-2xl"
            }
          />
        ))}
      </div>
    </div>
  );
}
