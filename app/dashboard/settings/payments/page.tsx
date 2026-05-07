import type { Metadata } from "next";
import { getPayoutAccount, listBanks } from "@/lib/api/payments";
import { SettingsCard } from "@/components/settings/settings-card";
import { PayoutAccountSummary } from "@/components/payments/payout-account-summary";

export const metadata: Metadata = { title: "Payments · Settings · Acroma" };

export default async function PaymentsSettingsPage() {
  const [account, banksBank, banksMomo] = await Promise.all([
    getPayoutAccount(),
    listBanks("bank"),
    listBanks("momo"),
  ]);

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Payouts"
        description="Where Acroma sends the money customers pay you. Add a Ghanaian bank account or mobile money number."
      >
        <PayoutAccountSummary
          account={account}
          banksBank={banksBank}
          banksMomo={banksMomo}
        />
      </SettingsCard>
    </div>
  );
}
