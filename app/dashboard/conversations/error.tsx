"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ConversationsError({
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
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="eyebrow text-brand-orange">Something broke</p>
      <h2 className="font-display mt-3 text-2xl font-medium tracking-tight">
        We couldn&apos;t load your conversations.
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
