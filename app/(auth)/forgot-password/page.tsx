import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password · Acroma",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Acroma · Account recovery"
      headline={
        <>
          Locked out?
          <br />
          <span className="text-brand-orange">Let&apos;s get you back in.</span>
        </>
      }
      body="Tell us the email on your Acroma account and we'll send a fresh sign-in link to your inbox."
      footer={
        <span>
          Remembered it?{" "}
          <Link
            href="/login"
            className="text-brand-orange font-medium underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </span>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
