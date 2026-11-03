"use client"

import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ConfirmSpec } from "@/lib/impersonation-confirm"

type Props = {
  /** Open when set. */
  spec: ConfirmSpec | null
  businessName: string
  onSettle: (ok: boolean) => void
}

/**
 * The confirm step an admin sees before any change made while logged in as a
 * merchant. High-risk changes also need the merchant's name typed exactly.
 * Remounted (via `key`) for every request, so the typed value starts empty.
 */
export function ConfirmDialog({ spec, businessName, onSettle }: Props) {
  const [typed, setTyped] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = React.useId()

  const highRisk = spec?.risk === "high"
  const unlocked = !highRisk || typed.trim() === businessName

  function confirm() {
    if (unlocked) onSettle(true)
  }

  return (
    <AlertDialog
      open={spec !== null}
      onOpenChange={(open) => {
        if (!open) onSettle(false)
      }}
    >
      <AlertDialogContent
        onOpenAutoFocus={(event) => {
          // High risk: start in the name field. Otherwise Radix focuses Cancel.
          if (!highRisk) return
          event.preventDefault()
          inputRef.current?.focus()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{spec?.title}</AlertDialogTitle>
          <AlertDialogDescription>
            for <strong className="font-semibold">{businessName}</strong> as
            Acroma admin.
            {spec?.description && (
              <span className="mt-1 block">{spec.description}</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {highRisk && (
          <div className="grid gap-2">
            <Label htmlFor={inputId}>Type {businessName} to confirm</Label>
            <Input
              id={inputId}
              ref={inputRef}
              value={typed}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setTyped(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  confirm()
                }
              }}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={highRisk ? "destructive" : "default"}
            disabled={!unlocked}
            onClick={(event) => {
              event.preventDefault()
              confirm()
            }}
          >
            {spec?.confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
