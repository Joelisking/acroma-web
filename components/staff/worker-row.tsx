import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/ui/copy-button"
import { cn } from "@/lib/utils"
import type { Staff } from "@/lib/api/types"

import { ResetPasswordButton } from "./reset-password-button"
import { WorkerStatusButton } from "./worker-status-button"

/** One worker: who they are, how they sign in, and what you can do about it. */
export function WorkerRow({ staff }: { staff: Staff }) {
  const deactivated = staff.deactivatedAt !== null

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "text-sm font-semibold text-foreground",
              deactivated && "text-muted-foreground"
            )}
          >
            {staff.name}
          </p>
          {staff.mustChangePassword && !deactivated ? (
            <Badge
              variant="outline"
              className="border-transparent bg-brand-blue-soft text-brand-blue"
            >
              Must change password
            </Badge>
          ) : null}
          {deactivated ? (
            <Badge variant="outline" className="text-muted-foreground">
              Deactivated
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <span className="truncate font-mono text-xs text-muted-foreground">
            {staff.username}
          </span>
          <CopyButton value={staff.username} label="Copy username" />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {deactivated ? null : <ResetPasswordButton staff={staff} />}
        <WorkerStatusButton staff={staff} />
      </div>
    </li>
  )
}
