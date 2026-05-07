import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { SettingsCard } from "@/components/settings/settings-card";
import { BusinessForm } from "@/components/settings/business-form";

export const metadata: Metadata = { title: "Business · Settings · Acroma" };

export default async function BusinessSettingsPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Business profile"
        description="Public-facing details and locale."
      >
        <BusinessForm
          defaults={{
            name: business.name,
            currency: business.currency,
            country: business.country,
            logoUrl: business.logoUrl ?? "",
          }}
        />
      </SettingsCard>
    </div>
  );
}
