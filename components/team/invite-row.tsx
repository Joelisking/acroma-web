"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Link2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { revokeInviteAction } from "@/lib/api/team-actions"
import type { TeamInvite } from "@/lib/api/types"

function expiresIn(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return "expired"
  const hours = Math.floor(ms / 3_600_000)
  if (hours >= 1) return `expires in ${hours}h`
  return `expires in ${Math.max(1, Math.round(ms / 60_000))} min`
}

/**
 * A link that is out in the world but not yet used. The URL itself is not
 * recoverable (the backend only keeps a hash), so the only action is to
 * cancel it and make a new one.
 */
export function InviteRow({ invite }: { invite: TeamInvite }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  function revoke() {
    startTransition(async () => {
      const result = await revokeInviteAction(invite.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Invite link cancelled")
      router.refresh()
    })
  }

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <Link2 className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-foreground">Invite link</span>
        <span className="text-muted-foreground">· {expiresIn(invite.expiresAt)}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={revoke}
        className="gap-1.5 text-muted-foreground hover:text-destructive"
      >
        <X className="size-3.5" />
        Cancel
      </Button>
    </li>
  )
}
