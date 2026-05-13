"use client";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="border-border/70 bg-card mx-auto max-w-3xl space-y-4 rounded-2xl border p-6">
      <h2 className="text-foreground text-base font-semibold">
        Couldn&apos;t load broadcast
      </h2>
      <Button onClick={() => reset()} size="sm">
        Try again
      </Button>
    </div>
  );
}
