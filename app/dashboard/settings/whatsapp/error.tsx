"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="border-border/70 bg-card rounded-2xl border p-6 text-center">
      <p className="eyebrow text-brand-orange">Couldn&apos;t load</p>
      <h2 className="font-display mt-3 text-xl font-medium tracking-tight">
        WhatsApp settings unavailable
      </h2>
      <p className="text-muted-foreground mt-2 text-sm">
        {error.message || "Try again."}
      </p>
      <Button onClick={() => reset()} className="mt-5 rounded-xl">
        Try again
      </Button>
    </div>
  );
}
