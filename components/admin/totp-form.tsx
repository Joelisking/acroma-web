"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cancelLoginAction, verifyTotpAction } from "@/lib/admin/auth-actions";
import type { AdminFormState } from "@/lib/admin/types";

const initial: AdminFormState = {};

export function TotpForm() {
  const [state, action, pending] = useActionState(verifyTotpAction, initial);

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="admin-code">Authenticator code</Label>
          <Input
            id="admin-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            className="font-mono tracking-widest"
            autoFocus
            required
          />
        </div>
        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Verifying…" : "Sign in"}
        </Button>
      </form>
      <form action={cancelLoginAction}>
        <Button type="submit" variant="ghost" size="sm" className="w-full">
          Start over
        </Button>
      </form>
    </div>
  );
}
