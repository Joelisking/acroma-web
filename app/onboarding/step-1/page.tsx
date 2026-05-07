import type { Metadata } from "next";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { BusinessTypeForm } from "@/components/onboarding/business-type-form";

export const metadata: Metadata = { title: "Tell us about your business · Acroma" };

export default function Step1Page() {
  return (
    <WizardShell
      step={1}
      eyebrow="Welcome to Acroma"
      title={
        <>
          What kind of business
          <br />
          are you running?
        </>
      }
      subtitle="We use this to give your AI assistant the right voice from day one."
    >
      <BusinessTypeForm />
    </WizardShell>
  );
}
