"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UserMinus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { removeMemberAction } from "@/lib/api/team-actions"
import type { TeamMember } from "@/lib/api/types"

/**
 * Removes an admin. They are signed out within minutes and cannot sign in
 * again; everything they did stays on record under their name. Not
 * reversible from here (send a new invite link instead), so it confirms.
 */
export function RemoveMemberButton({ member }: { member: TeamMember }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  function remove() {
    startTransition(async () => {
      const result = await removeMemberAction(member.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`${member.name} no longer has access`)
      router.refresh()
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <UserMinus className="size-3.5" />
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            They lose access to this business right away and cannot sign in
            again. To bring them back, send a new invite link. Everything they
            handled stays on record under their name.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep access</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={remove}>
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
