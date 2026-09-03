import type { Metadata } from "next";
import { getPayoutAccount, listBanks } from "@/lib/api/payments";
import { getCurrentBusiness } from "@/lib/api/business";
import { SettingsCard } from "@/components/settings/settings-card";
import { PayoutAccountSummary } from "@/components/payments/payout-account-summary";
import { AcceptCodToggle } from "@/components/settings/accept-cod-toggle";
import { redirectStaffHome } from "@/lib/api/owner-only";

export const metadata: Metadata = { title: "Payments · Settings · Acroma" };

export default async function PaymentsSettingsPage() {
  await redirectStaffHome();

  const [account, banksBank, banksMomo, business] = await Promise.all([
    getPayoutAccount(),
    listBanks("bank"),
    listBanks("momo"),
    getCurrentBusiness(),
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

      {business ? (
        <SettingsCard
          title="Payment methods"
          description="Choose which payment options Acroma offers your customers on WhatsApp."
        >
          <AcceptCodToggle initial={business.acceptsCashOnDelivery} />
        </SettingsCard>
      ) : null}
    </div>
  );
}
