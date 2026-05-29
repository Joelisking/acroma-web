import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { OnboardingOpeningHoursStep } from "@/components/onboarding/opening-hours-step";

export const metadata: Metadata = {
  title: "Opening hours · Acroma",
};

export default async function Step5Page() {
  const business = await getCurrentBusiness();

  return (
    <WizardShell
      step={5}
      eyebrow="Hours"
      title="When are you open?"
      subtitle="Acroma replies 'We're closed' during off-hours instead of pinging you."
    >
      <OnboardingOpeningHoursStep initial={business?.openingHours ?? null} />
    </WizardShell>
  );
}
