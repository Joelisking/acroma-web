import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password · Acroma",
};

type SearchParams = Promise<{ token?: string; email?: string }>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token, email } = await searchParams;

  return (
    <AuthShell
      eyebrow="Acroma · Account recovery"
      headline={
        <>
          Set a new
          <br />
          <span className="text-brand-orange">password.</span>
        </>
      }
      body="Make it strong. After you save, every device signed into this account will need to log in again."
      footer={
        <span>
          Changed your mind?{" "}
          <Link
            href="/login"
            className="text-brand-orange font-medium underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </span>
      }
    >
      {token && email ? (
        <ResetPasswordForm token={token} email={email} />
      ) : (
        <InvalidLink />
      )}
    </AuthShell>
  );
}

function InvalidLink() {
  return (
    <div className="space-y-5">
      <p className="text-brand-orange text-xs font-bold tracking-widest uppercase">
        Invalid reset link
      </p>
      <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
        This link is missing some details
      </h2>
      <p className="text-muted-foreground text-sm">
        The reset link looks incomplete. It may have been copied incorrectly or
        the email client trimmed part of it. Request a new one and we&apos;ll
        send a fresh link.
      </p>
      <Link
        href="/forgot-password"
        className="text-brand-orange text-sm font-medium underline-offset-4 hover:underline"
      >
        Request a new link
      </Link>
    </div>
  );
}
