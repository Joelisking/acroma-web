"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { KeyRound, Loader2 } from "lucide-react"

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { resetStaffPasswordAction } from "@/lib/api/staff-actions"
import type { Staff } from "@/lib/api/types"

import { TemporaryPasswordPanel } from "./temporary-password-panel"

/**
 * Issues a fresh temporary password for a worker who has been locked out or
 * shared theirs. Like creating a worker, the new password is shown once and
 * then gone, so the result dialog only closes on Done.
 */
export function ResetPasswordButton({ staff }: { staff: Staff }) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [password, setPassword] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  function reset() {
    startTransition(async () => {
      const result = await resetStaffPasswordAction(staff.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setConfirmOpen(false)
      setPassword(result.data.temporaryPassword)
      router.refresh()
    })
  }

  return (
    <>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <KeyRound className="size-3.5" />
            Reset password
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Reset the password for {staff.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Their current password stops working right away. We give you a new
              temporary one to pass on, and they pick their own the next time
              they sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Keep it</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(e) => {
                e.preventDefault()
                reset()
              }}
              className="gap-2"
            >
              {pending ? <Loader2 className="animate-spin" /> : null}
              Reset password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={password !== null} onOpenChange={() => undefined}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>New password for {staff.name}</DialogTitle>
            <DialogDescription>
              Copy it before you close this.
            </DialogDescription>
          </DialogHeader>
          {password ? (
            <TemporaryPasswordPanel
              workerName={staff.name}
              username={staff.username}
              password={password}
            />
          ) : null}
          <DialogFooter>
            <Button type="button" onClick={() => setPassword(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
