import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { SettingsCard } from "@/components/settings/settings-card";
import { AiForm } from "@/components/settings/ai-form";

export const metadata: Metadata = { title: "AI · Settings · Acroma" };

export default async function AiSettingsPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  return (
    <div className="space-y-6">
      <SettingsCard
        title="AI"
        description="Acroma's AI replies in your voice. Toggle it on or off and tune the context it uses for every reply."
      >
        <AiForm business={business} />
      </SettingsCard>
    </div>
  );
}
