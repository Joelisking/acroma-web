"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StaleDeployNotice } from "@/components/stale-deploy-notice";
import { useStaleDeployReload } from "@/hooks/use-stale-deploy-reload";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const stale = useStaleDeployReload(error);
  useEffect(() => {
    console.error(error);
  }, [error]);

  if (stale) return <StaleDeployNotice />;

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="text-brand-orange text-xs font-bold tracking-widest uppercase">
        Something broke
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight">
        We couldn&apos;t load your overview.
      </h2>
      <p className="text-muted-foreground mt-2 text-sm">
        {error.message || "Please try again in a moment."}
      </p>
      <Button onClick={() => reset()} className="mt-6 rounded-xl">
        Try again
      </Button>
    </div>
  );
}
