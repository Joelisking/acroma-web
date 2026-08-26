"use client"

import * as React from "react"
import { toast } from "sonner"
import { Copy, KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  /** The worker this password belongs to, used in the copy. */
  workerName: string
  username: string
  password: string
}

/**
 * The one and only sighting of a worker's temporary password. The backend
 * stores a hash and can never read it back, so if the owner closes this
 * without copying it, the only way forward is another reset. Keep the copy
 * plain and the action obvious.
 */
export function TemporaryPasswordPanel({
  workerName,
  username,
  password,
}: Props) {
  function copyPassword() {
    void navigator.clipboard
      .writeText(password)
      .then(() => toast.success("Password copied"))
      .catch(() => toast.error("Couldn't copy the password"))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl bg-brand-orange-soft p-4">
        <KeyRound className="mt-0.5 size-4 shrink-0 text-brand-orange" />
        <p className="text-sm leading-relaxed text-foreground">
          Give this password to {workerName} now. We will not show it again.
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          Temporary password
        </p>
        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
          <code className="flex-1 font-mono text-sm break-all text-foreground">
            {password}
          </code>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={copyPassword}
            className="gap-1.5"
          >
            <Copy className="size-3.5" />
            Copy
          </Button>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        They sign in with the username{" "}
        <span className="font-mono text-foreground">{username}</span> and this
        password, then pick a password of their own straight away.
      </p>
    </div>
  )
}
