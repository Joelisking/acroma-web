"use client";

import { Button } from "@/components/ui/button";
import { StaleDeployNotice } from "@/components/stale-deploy-notice";
import { useStaleDeployReload } from "@/hooks/use-stale-deploy-reload";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const stale = useStaleDeployReload(error);
  if (stale) return <StaleDeployNotice />;

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 py-12">
      <p className="text-foreground text-lg font-semibold">
        Couldn&apos;t load analytics.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
