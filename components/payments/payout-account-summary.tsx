"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayoutAccountForm } from "./payout-account-form";
import { removePayoutAccountAction } from "@/lib/api/payments-actions";
import type { BankSummary, PayoutAccount } from "@/lib/api/types";

export function PayoutAccountSummary({
  account,
  banksBank,
  banksMomo,
}: {
  account: PayoutAccount;
  banksBank: BankSummary[];
  banksMomo: BankSummary[];
}) {
  const [editing, setEditing] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);

  if (editing) {
    return (
      <PayoutAccountForm
        onSaved={() => setEditing(false)}
        onCancel={() => setEditing(false)}
        banksBank={banksBank}
        banksMomo={banksMomo}
      />
    );
  }

  if (!account.paystackSubaccountCode) {
    return (
      <PayoutAccountForm
        onSaved={() => undefined}
        banksBank={banksBank}
        banksMomo={banksMomo}
      />
    );
  }

  async function remove() {
    setRemoving(true);
    const result = await removePayoutAccountAction();
    setRemoving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Payout account removed");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-5">
        <div className="text-sm text-muted-foreground">Paying out to</div>
        <div className="text-xl font-semibold mt-1">
          {account.payoutAccountName}
        </div>
        <div className="text-sm text-muted-foreground mt-3">
          {account.payoutBankName} · {account.payoutAccountNumber}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={remove}
          disabled={removing}
          className="gap-2"
        >
          {removing ? <Loader2 className="animate-spin" /> : null}
          Remove
        </Button>
        <Button onClick={() => setEditing(true)}>Change payout account</Button>
      </div>
    </div>
  );
}
