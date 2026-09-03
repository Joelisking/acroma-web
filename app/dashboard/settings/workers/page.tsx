import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCurrentBusiness } from "@/lib/api/business"
import { readRole } from "@/lib/api/cookies"
import { STAFF_HOME } from "@/lib/api/owner-only"
import { listStaff } from "@/lib/api/staff"
import { SettingsCard } from "@/components/settings/settings-card"
import { WorkersList } from "@/components/staff/workers-list"

export const metadata: Metadata = { title: "Workers · Settings · Acroma" }

export default async function WorkersSettingsPage() {
  // Owner-only screen. The backend is the real gate; this just keeps a worker
  // from landing on a page that would only show them an error.
  if ((await readRole()) === "STAFF") redirect(STAFF_HOME)

  const [staff, business] = await Promise.all([
    listStaff(),
    getCurrentBusiness(),
  ])

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Workers"
        description="Give the people who work with you their own login. Workers get the till and today's orders, nothing else, and every action they take is recorded under their name."
      >
        <WorkersList staff={staff} businessName={business?.name ?? ""} />
      </SettingsCard>
    </div>
  )
}
