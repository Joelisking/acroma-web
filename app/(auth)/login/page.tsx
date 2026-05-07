import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in · Acroma",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Acroma · Dashboard"
      headline={
        <>
          Every conversation,
          <br />
          <span className="text-brand-orange">every order</span>
          <br />
          in one place.
        </>
      }
      body="Acroma keeps the AI in the chat and you in control. Sign in to see what's been happening while you were away."
      footer={
        <span>
          New to Acroma?{" "}
          <Link
            href="/register"
            className="text-brand-orange font-medium underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
