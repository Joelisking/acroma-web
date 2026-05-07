"use client";

import * as React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeOnboardingAction } from "@/lib/api/onboarding-actions";

export function FinishStep() {
  const [pending, startTransition] = React.useTransition();

  function finish() {
    startTransition(() => {
      void completeOnboardingAction();
    });
  }

  return (
    <div className="space-y-8">
      <div className="border-border/70 bg-secondary text-secondary-foreground surface-grain relative overflow-hidden rounded-2xl border p-8">
        <div
          aria-hidden
          className="bg-brand-orange/40 absolute -top-12 -right-12 size-48 rounded-full blur-3xl"
        />
        <div className="relative space-y-4">
          <span className="bg-brand-orange/15 text-brand-orange inline-flex size-12 items-center justify-center rounded-2xl">
            <Sparkles className="size-6" strokeWidth={1.75} />
          </span>
          <h2 className="font-display text-3xl leading-tight font-medium tracking-tight">
            You&apos;re ready.
          </h2>
          <p className="text-secondary-foreground/75 max-w-md text-sm leading-relaxed">
            Acroma is set up. The moment a customer messages your WhatsApp,
            you&apos;ll see it light up the dashboard in real time — orders,
            payments, and all.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={finish}
          disabled={pending}
          className="bg-brand-orange hover:bg-brand-orange/90 h-11 gap-2 rounded-xl px-6 text-sm"
        >
          {pending ? <Loader2 className="animate-spin" /> : null}
          Take me to my dashboard
        </Button>
      </div>
    </div>
  );
}
