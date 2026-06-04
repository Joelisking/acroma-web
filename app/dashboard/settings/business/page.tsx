import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { getVocabulary } from "@/lib/vocabulary";
import { SettingsCard } from "@/components/settings/settings-card";
import { BusinessForm } from "@/components/settings/business-form";
import { AcceptPickupToggle } from "@/components/settings/accept-pickup-toggle";
import { OrderAlertsToggle } from "@/components/settings/order-alerts-toggle";
import { CatalogImagesManager } from "@/components/catalog/catalog-images-manager";

export const metadata: Metadata = { title: "Business · Settings · Acroma" };

export default async function BusinessSettingsPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const vocab = getVocabulary(business.businessType);

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

      <SettingsCard
        title={`${vocab.catalog} images`}
        description={`Upload up to 8 images of your ${vocab.catalog.toLowerCase()}. When customers ask what you have, Acroma sends these images on WhatsApp, in the order you set.`}
      >
        <CatalogImagesManager
          defaultUrls={business.catalogImageUrls ?? []}
          noun={vocab.catalog}
        />
      </SettingsCard>

      <SettingsCard
        title="Order handling"
        description="Choose how customers can receive their orders."
      >
        <div className="space-y-6">
          <AcceptPickupToggle initial={business.acceptsPickup} />
          <OrderAlertsToggle initial={business.orderAlertsEnabled} />
        </div>
      </SettingsCard>
    </div>
  );
}
