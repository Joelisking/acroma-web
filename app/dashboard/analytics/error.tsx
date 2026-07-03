"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 py-12">
      <p className="text-foreground text-lg font-semibold">
        Couldn&apos;t load analytics.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
