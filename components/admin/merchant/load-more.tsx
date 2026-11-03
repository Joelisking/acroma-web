import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  basePath: string;
  params: Record<string, string | undefined>;
  nextCursor: string | null;
};

/** Next-page link: keeps the current filters and passes the backend cursor. */
export function LoadMore({ basePath, params, nextCursor }: Props) {
  if (!nextCursor && !params.cursor) return null;

  const link = (cursor?: string) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...params, cursor })) {
      if (v) qs.set(k, v);
    }
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <div className="flex justify-end gap-2">
      {params.cursor ? (
        <Link href={link()} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          Back to first page
        </Link>
      ) : null}
      {nextCursor ? (
        <Link
          href={link(nextCursor)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Load more
        </Link>
      ) : null}
    </div>
  );
}
