import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="-mx-4 -mt-6 h-full sm:-mx-6 md:mx-0 md:mt-0">
      <div className="bg-card md:border-border flex h-full w-full overflow-hidden md:rounded-2xl md:border">
        <div className="border-border flex w-full flex-col gap-3 p-4 md:w-[340px] md:border-r">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-8 w-full rounded-full" />
          <div className="mt-1 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <Skeleton className="size-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden flex-1 md:block" />
      </div>
    </div>
  );
}
