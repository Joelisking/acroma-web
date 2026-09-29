import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { CatalogDoneStep } from "@/components/onboarding/catalog-done-step";

export const metadata: Metadata = { title: "All set · Acroma" };

export default async function Step7Page() {
  const business = await getCurrentBusiness();
  return (
    <WizardShell
      step={7}
      eyebrow="Almost there"
      title="One last thing."
      subtitle="Let's open your live dashboard so you can watch Acroma work."
    >
      <CatalogDoneStep realEstate={business?.businessType === "REAL_ESTATE"} />
    </WizardShell>
  );
}
