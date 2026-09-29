"use client";

import { Button } from "@/components/ui/button";
import { StaleDeployNotice } from "@/components/stale-deploy-notice";
import { useStaleDeployReload } from "@/hooks/use-stale-deploy-reload";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const stale = useStaleDeployReload(error);
  if (stale) return <StaleDeployNotice />;

  return (
    <div className="card-warm mx-auto max-w-2xl space-y-4 p-6">
      <h2 className="text-foreground text-base font-semibold">
        Couldn&apos;t load this discount
      </h2>
      <Button onClick={() => reset()} size="sm">
        Try again
      </Button>
    </div>
  );
}
