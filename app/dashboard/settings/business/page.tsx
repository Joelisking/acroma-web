import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { SettingsCard } from "@/components/settings/settings-card";
import { BusinessForm } from "@/components/settings/business-form";
import { AcceptPickupToggle } from "@/components/settings/accept-pickup-toggle";
import { OrderAlertsToggle } from "@/components/settings/order-alerts-toggle";
import { CatalogImagesForm } from "@/components/settings/catalog-images-form";

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

      <SettingsCard
        title="Catalog images"
        description="Upload up to 3 images of your catalog. When customers ask what you have, Acroma sends these images on WhatsApp."
      >
        <CatalogImagesForm defaultUrls={business.catalogImageUrls ?? []} />
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
