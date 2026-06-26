import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";

export function PayoutNudgeBanner() {
  return (
    <div className="card-warm flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="bg-brand-orange-soft text-brand-orange flex h-10 w-10 items-center justify-center rounded-full">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <div className="font-medium">Set up your payouts</div>
          <div className="text-sm text-muted-foreground">
            Add your bank or mobile money so customers can pay you through
            Acroma.
          </div>
        </div>
      </div>
      <Link
        href="/dashboard/settings/payments"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Set up <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
