import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/api/auth";
import { getOnboardingStatus } from "@/lib/api/onboarding";

/**
 * Onboarding gate.
 * - Unauthenticated → /login
 * - Already onboarded → /dashboard
 */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) redirect("/api/auth/expired");

  try {
    const status = await getOnboardingStatus();
    if (status.onboardingCompleted) redirect("/dashboard");
  } catch {
    // If status fails, let the user proceed and surface errors per-step.
  }

  return children;
}
