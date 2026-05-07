import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { BusinessProfileForm } from "@/components/onboarding/business-profile-form";

export const metadata: Metadata = { title: "Your business profile · Acroma" };

export default async function Step2Page() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  return (
    <WizardShell
      step={2}
      eyebrow="Profile"
      title="Quick details about your shop."
      subtitle="You can change any of this later in Settings."
    >
      <BusinessProfileForm
        defaults={{
          name: business.name,
          country: business.country || "GH",
          currency: business.currency || "GHS",
        }}
      />
    </WizardShell>
  );
}
