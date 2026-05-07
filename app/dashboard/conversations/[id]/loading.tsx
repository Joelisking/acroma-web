import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex h-[calc(100svh-7rem)] w-full max-w-3xl flex-col">
      <div className="border-border/70 flex items-center gap-3 border-b py-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden py-4">
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
