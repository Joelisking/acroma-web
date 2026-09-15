"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Link2, UserRoundPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createInviteAction } from "@/lib/api/team-actions"
import type { CreatedInvite } from "@/lib/api/types"

/**
 * Mints an invite link and shows it once. The URL lives in this component's
 * state and nowhere else (the backend only keeps a hash), so closing the
 * dialog loses it. Pressing the trigger creates the link immediately: there
 * is nothing to fill in, so a confirmation step would only be friction.
 */
export function CreateInviteDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [invite, setInvite] = React.useState<CreatedInvite | null>(null)
  const [pending, startTransition] = React.useTransition()

  function create() {
    startTransition(async () => {
      const result = await createInviteAction()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setInvite(result.data)
      setOpen(true)
      router.refresh()
    })
  }

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setInvite(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          disabled={pending}
          onClick={(e) => {
            // Create first, open on success. Radix would otherwise open an
            // empty dialog on click.
            e.preventDefault()
            create()
          }}
        >
          <UserRoundPlus className="size-3.5" />
          {pending ? "Creating link" : "Invite someone"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send this link</DialogTitle>
          <DialogDescription>
            Whoever opens it creates their own login and joins your business
            with full access. It works once and expires in 24 hours. Copy it
            now: it will not be shown again.
          </DialogDescription>
        </DialogHeader>

        {invite ? <InviteLinkPanel url={invite.url} /> : null}

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InviteLinkPanel({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5">
      <Link2 className="size-4 shrink-0 text-muted-foreground" />
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
        {url}
      </code>
      <CopyButton value={url} label="Copy invite link" />
    </div>
  )
}
