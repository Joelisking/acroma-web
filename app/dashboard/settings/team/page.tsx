import type { Metadata } from "next"

import { getTeam } from "@/lib/api/team"
import { redirectStaffHome } from "@/lib/api/owner-only"
import { SettingsCard } from "@/components/settings/settings-card"
import { TeamList } from "@/components/team/team-list"

export const metadata: Metadata = { title: "Team · Settings · Acroma" }

export default async function TeamSettingsPage() {
  // Owner-level screen. The backend is the real gate; this just keeps a worker
  // from landing on a page that would only show them an error.
  await redirectStaffHome()

  const team = await getTeam()

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Team"
        description="People who run this business with you. Everyone here can do everything you can: orders, chats, catalog, payments and settings. Share an invite link to add someone."
      >
        <TeamList team={team} />
      </SettingsCard>
    </div>
  )
}
