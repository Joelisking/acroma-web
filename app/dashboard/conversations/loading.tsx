import { ConversationListSkeleton } from "@/components/conversations/list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-56" />
        </div>
        <Skeleton className="h-9 w-72 rounded-full" />
      </header>
      <ConversationListSkeleton />
    </div>
  );
}
