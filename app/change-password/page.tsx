import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { isAuthenticated, logoutAction } from "@/lib/api/auth";
import { readMustChangePassword, readRole } from "@/lib/api/cookies";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = {
  title: "Choose your password · Acroma",
};

/**
 * Workers only. A signed out visitor is sent to sign in and an owner to the
 * dashboard, so nobody is left staring at a form the backend would reject.
 * An owner changes their password in settings instead.
 */
export default async function ChangePasswordPage() {
  if (!(await isAuthenticated())) redirect("/login");
  if ((await readRole()) !== "STAFF") redirect("/dashboard");

  const forced = await readMustChangePassword();

  return (
    <AuthShell
      eyebrow="Acroma · Your account"
      headline={
        <>
          Pick a password
          <br />
          <span className="text-brand-orange">only you know.</span>
        </>
      }
      body={
        forced
          ? "You signed in with a temporary password. Choose your own now, then you can get to the orders."
          : "Choose a new password for your login. You stay signed in on this device."
      }
      footer={
        <form action={logoutAction}>
          <span className="text-muted-foreground">Not your account? </span>
          <button
            type="submit"
            className="text-brand-orange font-medium underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </form>
      }
    >
      <ChangePasswordForm forced={forced} />
    </AuthShell>
  );
}
