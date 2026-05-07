import "server-only";

import { apiFetch } from "./server";

export type OnboardingStatus = {
  onboardingCompleted: boolean;
  onboardingStep: number;
};

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  return apiFetch<OnboardingStatus>("/onboarding/status");
}
