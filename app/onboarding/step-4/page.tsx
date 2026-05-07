import type { Metadata } from "next";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { PayoutStep } from "@/components/onboarding/payout-step";
import { listBanks } from "@/lib/api/payments";

export const metadata: Metadata = { title: "Set up payouts · Acroma" };

export default async function Step4Page() {
  const [banksBank, banksMomo] = await Promise.all([
    listBanks("bank"),
    listBanks("momo"),
  ]);
  return (
    <WizardShell
      step={4}
      eyebrow="Payouts"
      title="Where should we send your money?"
      subtitle="Add your bank or mobile money so customers can pay you through Acroma. You can skip this and set it up later."
    >
      <PayoutStep banksBank={banksBank} banksMomo={banksMomo} />
    </WizardShell>
  );
}
