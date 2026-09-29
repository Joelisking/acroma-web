"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StaleDeployNotice } from "@/components/stale-deploy-notice";
import { useStaleDeployReload } from "@/hooks/use-stale-deploy-reload";

/**
 * Root error boundary. Catches anything the segment boundaries under
 * `app/dashboard/**` don't — the auth screens, layouts, onboarding — which
 * would otherwise surface as Next's bare "client-side exception" text.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const stale = useStaleDeployReload(error);
  const router = useRouter();

  useEffect(() => {
    if (!stale) console.error(error);
  }, [error, stale]);

  if (stale) return <StaleDeployNotice />;

  return (
    <div className="flex min-h-svh items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-brand-orange text-xs font-bold tracking-widest uppercase">
          Something broke
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          We couldn&apos;t load this page.
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {error.message || "Please try again in a moment."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            onClick={() => startTransition(() => {
              router.refresh();
              reset();
            })}
            className="rounded-xl"
          >
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="rounded-xl"
          >
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
