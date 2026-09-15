import { Badge } from "@/components/ui/badge"
import type { TeamMember } from "@/lib/api/types"

import { RemoveMemberButton } from "./remove-member-button"

/** One person with owner-level access, and whether they can be removed. */
export function MemberRow({ member }: { member: TeamMember }) {
  const isOwner = member.role === "OWNER"

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{member.name}</p>
          <Badge
            variant="outline"
            className={
              isOwner
                ? "border-transparent bg-brand-orange-soft text-brand-orange"
                : "border-transparent bg-brand-blue-soft text-brand-blue"
            }
          >
            {isOwner ? "Owner" : "Admin"}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
      </div>

      {/* The original owner is the business itself and cannot be removed.
          Anyone else can be, by an owner or a fellow admin. */}
      {isOwner ? null : (
        <div className="flex shrink-0 items-center gap-2">
          <RemoveMemberButton member={member} />
        </div>
      )}
    </li>
  )
}
