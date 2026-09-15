import Link from "next/link";
import { LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** The join page when the link is expired, used, cancelled, or unknown. */
export function InviteDeadEnd({ reason }: { reason: string }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
        <LinkIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="space-y-1 text-sm">
          <p className="font-medium text-foreground">{reason}</p>
          <p className="text-muted-foreground">
            Each link works once and expires 24 hours after it was created.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" className="h-12 w-full">
        <Link href="/login">Go to sign in</Link>
      </Button>
    </div>
  );
}
