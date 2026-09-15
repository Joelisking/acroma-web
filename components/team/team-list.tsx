import type { TeamResponse } from "@/lib/api/types"

import { CreateInviteDialog } from "./create-invite-dialog"
import { InviteRow } from "./invite-row"
import { MemberRow } from "./member-row"

/**
 * Members first (owner pinned at the top by the backend), then any links
 * that are still waiting to be used.
 */
export function TeamList({ team }: { team: TeamResponse }) {
  const { members, invites } = team

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {members.length === 1
              ? "Just you so far."
              : `${members.length} people`}
          </p>
          <CreateInviteDialog />
        </div>

        <ul className="divide-y divide-border/70">
          {members.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </ul>
      </div>

      {invites.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Waiting to be used
          </p>
          <ul className="divide-y divide-border/70 rounded-xl border border-border/70">
            {invites.map((i) => (
              <InviteRow key={i.id} invite={i} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
