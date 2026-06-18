"use client";

import * as React from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SettingsCard } from "./settings-card";
import { logoutAction } from "@/lib/api/auth";

/**
 * Sign-out control on the Security settings page. Gives mobile users a
 * labelled way out, since the sidebar account menu is desktop-only.
 */
export function SignOutCard() {
  const [pending, startTransition] = React.useTransition();

  function onSignOut() {
    startTransition(() => {
      void logoutAction();
    });
  }

  return (
    <SettingsCard
      title="Sign out"
      description="Sign out of Acroma on this device. You can sign back in any time with your email and password."
    >
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={onSignOut}
          disabled={pending}
          className="h-10 gap-2 rounded-xl px-5"
        >
          <LogOut />
          Sign out
        </Button>
      </div>
    </SettingsCard>
  );
}
