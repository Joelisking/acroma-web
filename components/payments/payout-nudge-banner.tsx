import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PayoutNudgeBanner() {
  return (
    <div className="card-warm flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <div className="font-semibold">Set up your payouts</div>
        <div className="text-muted-foreground text-sm">
          Add your bank or mobile money so customers can pay you through Acroma.
        </div>
      </div>
      <Link
        href="/dashboard/settings/payments"
        className="text-primary inline-flex shrink-0 items-center gap-1 text-sm font-semibold whitespace-nowrap hover:underline"
      >
        Set up <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
