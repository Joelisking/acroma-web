import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create your account · Acroma",
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Pre-Seed · 2026"
      headline={
        <>
          Built for commerce
          <br />
          <span className="text-brand-orange">on WhatsApp.</span>
        </>
      }
      body="Set up your business in minutes. Acroma's AI handles the inbox so you can run the rest of your day."
      footer={
        <span>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-brand-orange font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </span>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
