"use client";

import { Button } from "@/components/ui/button";
import { StaleDeployNotice } from "@/components/stale-deploy-notice";
import { useStaleDeployReload } from "@/hooks/use-stale-deploy-reload";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const stale = useStaleDeployReload(error);
  if (stale) return <StaleDeployNotice />;

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-6">
      <h2 className="text-foreground text-base font-semibold">
        Couldn&apos;t load opening hours
      </h2>
      <p className="text-muted-foreground text-sm">
        Something went wrong loading the settings.
      </p>
      <Button onClick={() => reset()} size="sm">
        Try again
      </Button>
    </div>
  );
}
