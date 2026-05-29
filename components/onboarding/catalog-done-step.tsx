"use client";

import * as React from "react";
import { Sparkles, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  completeOnboardingAction,
  completeOnboardingAndGoToCatalogAction,
} from "@/lib/api/onboarding-actions";

export function CatalogDoneStep() {
  const [pendingDash, startDashTransition] = React.useTransition();
  const [pendingCatalog, startCatalogTransition] = React.useTransition();
  const anyPending = pendingDash || pendingCatalog;

  function goToDashboard() {
    startDashTransition(() => {
      void completeOnboardingAction();
    });
  }

  function goToCatalog() {
    startCatalogTransition(() => {
      void completeOnboardingAndGoToCatalogAction();
    });
  }

  return (
    <div className="space-y-6">
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

      <div className="border-border/70 bg-card flex items-start gap-3 rounded-2xl border p-5">
        <span className="bg-brand-orange/15 text-brand-orange mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl">
          <Package className="size-4.5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="space-y-1">
          <p className="text-foreground text-sm font-medium">Add your catalog</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Your catalog is what Acroma uses to describe products and take
            orders. Add items now or come back any time from the dashboard.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={goToDashboard}
          disabled={anyPending}
          className="h-11 rounded-xl px-6 text-sm"
        >
          {pendingDash ? <Loader2 className="size-4 animate-spin" /> : null}
          Take me to my dashboard
        </Button>
        <Button
          onClick={goToCatalog}
          disabled={anyPending}
          className="bg-brand-orange hover:bg-brand-orange/90 h-11 gap-2 rounded-xl px-6 text-sm"
        >
          {pendingCatalog ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Set up my catalog first
        </Button>
      </div>
    </div>
  );
}
