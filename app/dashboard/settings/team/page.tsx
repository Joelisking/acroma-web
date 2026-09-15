import type { Metadata } from "next"

import { getCurrentBusiness } from "@/lib/api/business"
import { readActorEmail } from "@/lib/api/cookies"
import { redirectStaffHome } from "@/lib/api/owner-only"
import { listStaff } from "@/lib/api/staff"
import { getTeam } from "@/lib/api/team"
import { SettingsCard } from "@/components/settings/settings-card"
import { WorkersList } from "@/components/staff/workers-list"
import { TeamList } from "@/components/team/team-list"

export const metadata: Metadata = { title: "Team · Settings · Acroma" }

/**
 * Everyone who can sign in to this business, on one screen: the people with
 * full access at the top, then till workers. Two kinds of account, one place
 * to manage them.
 */
export default async function TeamSettingsPage() {
  // Owner-level screen. The backend is the real gate; this just keeps a worker
  // from landing on a page that would only show them an error.
  await redirectStaffHome()

  const [team, staff, business, viewerEmail] = await Promise.all([
    getTeam(),
    listStaff(),
    getCurrentBusiness(),
    readActorEmail(),
  ])

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Team"
        description="People who run this business with you. Everyone here can do everything you can: orders, chats, catalog, payments and settings. Share an invite link to add someone."
      >
        <TeamList team={team} viewerEmail={viewerEmail} />
      </SettingsCard>

      <SettingsCard
        title="Workers"
        description="Give the people who work with you their own login. Workers get the till and today's orders, nothing else, and every action they take is recorded under their name."
      >
        <WorkersList staff={staff} businessName={business?.name ?? ""} />
      </SettingsCard>
    </div>
  )
}
