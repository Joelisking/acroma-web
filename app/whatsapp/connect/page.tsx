import type { Metadata } from "next"
import Link from "next/link"
import { apiFetch } from "@/lib/api/server"
import { redirectStaffHome } from "@/lib/api/owner-only"
import type { SignupAvailability } from "@/lib/api/whatsapp-onboarding"
import { WhatsappConnect } from "@/components/settings/whatsapp-connect"
export const metadata: Metadata = { title: "Connect WhatsApp · Acroma" }
export default async function ConnectWhatsappPage() {
  await redirectStaffHome()
  const availability = await apiFetch<SignupAvailability>(
    "/whatsapp-onboarding/availability"
  )
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-12">
      <Link
        href="/dashboard/settings/whatsapp"
        className="text-sm text-primary"
      >
        Back to WhatsApp settings
      </Link>
      <h1 className="text-3xl font-semibold">Connect WhatsApp</h1>
      {availability.hasExistingSender ? (
        <p>
          Your sender is already connected. Contact support before moving it to
          a different Meta account.
        </p>
      ) : availability.enabled ? (
        <WhatsappConnect />
      ) : (
        <p>
          Self-service WhatsApp setup is being prepared for your account.
          Contact info@asera.tech for help connecting.
        </p>
      )}
    </main>
  )
}
