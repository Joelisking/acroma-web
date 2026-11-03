"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RotateCcw, UserMinus } from "lucide-react"

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
import {
  deactivateStaffAction,
  reactivateStaffAction,
} from "@/lib/api/staff-actions"
import {
  useConfirmedAction,
  type ConfirmSpec,
} from "@/components/impersonation/use-confirmed-action"
import type { Staff } from "@/lib/api/types"

/**
 * Turns a worker login off or back on. Deactivating is reversible and keeps
 * everything they did on record, so only that direction asks to confirm.
 */
export function WorkerStatusButton({ staff }: { staff: Staff }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const confirm = useConfirmedAction()
  const deactivated = staff.deactivatedAt !== null

  function run(
    action: () => Promise<{ ok: boolean; error?: string }>,
    done: string,
    spec: ConfirmSpec
  ) {
    startTransition(async () => {
      const result = await confirm(spec, action)
      if (!result) return
      if (!result.ok) {
        toast.error(result.error ?? "Something went wrong")
        return
      }
      toast.success(done)
      router.refresh()
    })
  }

  if (deactivated) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          run(
            () => reactivateStaffAction(staff.id),
            `${staff.name} can sign in again`,
            { title: `Restore access for staff member ${staff.name}` }
          )
        }
        className="gap-1.5"
      >
        <RotateCcw className="size-3.5" />
        Restore access
      </Button>
    )
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
          Deactivate
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate {staff.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            They are signed out and cannot sign in again until you restore them.
            Everything they handled stays on record under their name.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep access</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={() =>
              run(
                () => deactivateStaffAction(staff.id),
                `${staff.name} can no longer sign in`,
                {
                  title: `Deactivate staff member ${staff.name}`,
                  description: "They are signed out and cannot sign in again.",
                  risk: "high",
                  confirmLabel: "Deactivate staff member",
                }
              )
            }
          >
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
