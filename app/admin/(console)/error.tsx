"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

import { StaleDeployNotice } from "@/components/stale-deploy-notice";
import { Button } from "@/components/ui/button";
import { useStaleDeployReload } from "@/hooks/use-stale-deploy-reload";

export default function AdminConsoleError({
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
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="text-xs font-bold tracking-widest text-brand-orange uppercase">
        Something broke
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight">We couldn&apos;t load this view.</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message || "Please try again in a moment."}
      </p>
      <Button
        onClick={() =>
          startTransition(() => {
            router.refresh();
            reset();
          })
        }
        className="mt-6 rounded-xl"
      >
        Try again
      </Button>
    </div>
  );
}
