"use client"

import * as React from "react"
import { UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { CreatedStaff } from "@/lib/api/types"

import { AddWorkerForm } from "./add-worker-form"
import { TemporaryPasswordPanel } from "./temporary-password-panel"

/**
 * Adds a worker login, then shows the temporary password once. The password
 * lives in this component's state and nowhere else, so closing the dialog
 * loses it for good. That's why a created worker pins the dialog open until
 * the owner presses Done.
 */
export function AddWorkerDialog({ businessName }: { businessName: string }) {
  const [open, setOpen] = React.useState(false)
  const [created, setCreated] = React.useState<CreatedStaff | null>(null)

  function onOpenChange(next: boolean) {
    if (!next && created) return
    setOpen(next)
  }

  function done() {
    setOpen(false)
    setCreated(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="gap-1.5">
          <UserPlus className="size-3.5" />
          Add worker
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!created}>
        <DialogHeader>
          <DialogTitle>
            {created ? `${created.name} can now sign in` : "Add a worker"}
          </DialogTitle>
          <DialogDescription>
            {created
              ? "Copy the password before you close this."
              : "They get their own login and see orders only."}
          </DialogDescription>
        </DialogHeader>

        {created ? (
          <>
            <TemporaryPasswordPanel
              workerName={created.name}
              username={created.username}
              password={created.temporaryPassword}
            />
            <DialogFooter>
              <Button type="button" onClick={done}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <AddWorkerForm
            businessName={businessName}
            onCreated={setCreated}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
