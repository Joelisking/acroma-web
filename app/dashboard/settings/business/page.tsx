import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { getVocabulary } from "@/lib/vocabulary";
import { SettingsCard } from "@/components/settings/settings-card";
import { BusinessForm } from "@/components/settings/business-form";
import { DeliveryFeeField } from "@/components/settings/delivery-fee-field"
import { AcceptPickupToggle } from "@/components/settings/accept-pickup-toggle";
import { OrderAlertsToggle } from "@/components/settings/order-alerts-toggle";
import { CatalogImagesManager } from "@/components/catalog/catalog-images-manager";
import { redirectStaffHome } from "@/lib/api/owner-only";

export const metadata: Metadata = { title: "Business · Settings · Acroma" };

export default async function BusinessSettingsPage() {
  await redirectStaffHome();

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
            contactPhone: business.contactPhone ?? "",
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

      {business.businessType === "SERVICES" ? (
        // Services don't deliver, so pickup-vs-delivery doesn't apply. The
        // in-flight alert still fires for bookings, so we keep it (reworded).
        <SettingsCard
          title="Booking alerts"
          description="Stay on top of incoming bookings."
        >
          <OrderAlertsToggle
            initial={business.orderAlertsEnabled}
            title="Alert me when a booking is about to be made"
            description="Get a heads-up the moment a customer is mid-booking, before they confirm."
          />
        </SettingsCard>
      ) : (
        <SettingsCard
          title="Order handling"
          description="Choose how customers can receive their orders."
        >
          <div className="space-y-6">
            <AcceptPickupToggle initial={business.acceptsPickup} />
            <DeliveryFeeField
              initial={business.deliveryFee}
              currency={business.currency}
            />
            <OrderAlertsToggle initial={business.orderAlertsEnabled} />
          </div>
        </SettingsCard>
      )}
    </div>
  );
}
