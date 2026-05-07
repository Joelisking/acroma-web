import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/api/auth";

/**
 * Auth route group — login + register.
 * Already-authenticated visitors are bounced to the dashboard.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await isAuthenticated()) {
    redirect("/dashboard");
  }
  return children;
}
