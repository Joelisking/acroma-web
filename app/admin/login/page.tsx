import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import { TotpForm } from "@/components/admin/totp-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { readPendingToken } from "@/lib/admin/cookies";

export const metadata: Metadata = { title: "Admin sign in · Acroma" };

export default async function AdminLoginPage() {
  const awaitingCode = (await readPendingToken()) !== null;

  return (
    <div className="theme-warm bg-paper text-foreground flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin access</CardTitle>
          <CardDescription>
            {awaitingCode
              ? "Enter the 6-digit code from your authenticator app."
              : "Sign in with your admin email and password."}
          </CardDescription>
        </CardHeader>
        <CardContent>{awaitingCode ? <TotpForm /> : <LoginForm />}</CardContent>
      </Card>
    </div>
  );
}
