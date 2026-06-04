import type { Metadata } from "next";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { WhatsappStep } from "@/components/onboarding/whatsapp-step";

export const metadata: Metadata = { title: "Connect WhatsApp · Acroma" };

export default function Step3Page() {
  return (
    <WizardShell
      step={3}
      eyebrow="WhatsApp"
      title="Bring Acroma into your inbox."
      subtitle="This is the moment Acroma starts working. Once your number is connected, every message is handled in real time."
    >
      <WhatsappStep />
    </WizardShell>
  );
}
