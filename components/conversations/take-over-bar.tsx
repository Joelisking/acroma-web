"use client";

import { SlideToTakeOver } from "./slide-to-take-over";

type Props = {
  conversationId: string;
  status: "AI_HANDLING" | "RESOLVED";
};

/**
 * Bottom bar shown when the owner is not in control: a short status line plus
 * the slide-to-take-over control. Replaces the old disabled "AI is replying"
 * banner.
 */
export function TakeOverBar({ conversationId, status }: Props) {
  const resolved = status === "RESOLVED";
  return (
    <div className="border-border/70 bg-background sticky bottom-0 border-t px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:px-4 sm:pt-4 md:pb-4">
      <p className="text-muted-foreground mb-2.5 text-center text-xs">
        {resolved
          ? "This conversation is resolved."
          : "Acroma AI is replying to this customer."}
      </p>
      <SlideToTakeOver
        conversationId={conversationId}
        label={resolved ? "Slide to reopen" : "Slide to take over"}
      />
    </div>
  );
}
