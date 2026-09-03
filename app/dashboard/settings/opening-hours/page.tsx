import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { getBookingCapacity } from "@/lib/api/settings";
import { listProducts } from "@/lib/api/products";
import { SettingsCard } from "@/components/settings/settings-card";
import { OpeningHoursForm } from "@/components/settings/opening-hours-form";
import { BookingCapacityForm } from "@/components/settings/booking-capacity-form";
import { redirectStaffHome } from "@/lib/api/owner-only";

export const metadata: Metadata = {
  title: "Hours · Settings · Acroma",
};

export default async function OpeningHoursSettingsPage() {
  await redirectStaffHome();

  const business = await getCurrentBusiness();
  if (!business) return null;

  const isServices = business.businessType === "SERVICES";

  const [capacity, products] = isServices
    ? await Promise.all([getBookingCapacity(), listProducts()])
    : [null, []];

  const categories = Array.from(
    new Set(
      products
        .map((p) => (p.category ?? "").trim())
        .filter((c): c is string => c.length > 0),
    ),
  ).sort();

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Opening hours"
        description="When you're closed, Acroma replies to escalation requests with 'We're closed, back at X' instead of pinging you. Orders and other conversations still flow normally."
      >
        <OpeningHoursForm initial={business.openingHours} />
      </SettingsCard>

      {isServices && capacity ? (
        <SettingsCard
          title="Booking capacity"
          description="How many appointments you can run at once. When a customer asks for a time you cannot take, Acroma offers them the nearest open times instead."
        >
          <BookingCapacityForm initial={capacity} categories={categories} />
        </SettingsCard>
      ) : null}
    </div>
  );
}
