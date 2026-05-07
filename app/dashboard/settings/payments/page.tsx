import type { Metadata } from "next";
import { getPaystackSettings } from "@/lib/api/settings";
import { SettingsCard } from "@/components/settings/settings-card";
import { CopyField } from "@/components/settings/copy-field";
import { PaymentsForm } from "@/components/settings/payments-form";

export const metadata: Metadata = { title: "Payments · Settings · Acroma" };

export default async function PaymentsSettingsPage() {
  const paystack = await getPaystackSettings();

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Paystack"
        description="Acroma uses Paystack to collect MoMo and card payments. Add your live keys to start accepting money."
      >
        <CopyField
          label="Current secret key"
          value={paystack.secretKeyMasked}
          helper="Server stores the full key — only the prefix is shown here."
        />
        <PaymentsForm defaults={{ publicKey: paystack.publicKey ?? "" }} />
      </SettingsCard>
    </div>
  );
}
