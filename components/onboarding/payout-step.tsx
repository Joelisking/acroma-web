"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PayoutAccountForm } from "@/components/payments/payout-account-form";
import type { BankSummary } from "@/lib/api/types";

export function PayoutStep({
  banksBank,
  banksMomo,
}: {
  banksBank: BankSummary[];
  banksMomo: BankSummary[];
}) {
  const router = useRouter();

  return (
    <div className="space-y-5">
      <PayoutAccountForm
        banksBank={banksBank}
        banksMomo={banksMomo}
        onSaved={() => router.push("/onboarding/step-5")}
      />
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => router.push("/onboarding/step-5")}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
}
