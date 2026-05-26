import { Clock } from "lucide-react";
import { MarkResolvedButton } from "./mark-resolved-button";

type PendingOwnerBannerProps = {
  conversationId: string;
  pendingOwnerSince: string | null;
  escalationReason: string | null;
  /**
   * After an AI auto-takeover the conversation status flips back to
   * AI_HANDLING while `pendingOwnerSince` is still set — that's the
   * "AI holding the line" state. Lets the banner copy reflect it.
   */
  aiHoldingLine: boolean;
};

/**
 * Sits at the top of the conversation thread when the merchant still owes
 * a personal reply (`pendingOwnerSince` set). Renders nothing otherwise.
 * The escalation reason — captured at escalation time — is rendered as
 * text content, never innerHTML.
 */
export function PendingOwnerBanner({
  conversationId,
  pendingOwnerSince,
  escalationReason,
  aiHoldingLine,
}: PendingOwnerBannerProps) {
  if (!pendingOwnerSince) return null;

  const headline = aiHoldingLine
    ? "Acroma is holding the line while you reply."
    : "Your customer is waiting on a reply.";

  const reason = escalationReason?.trim();

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-brand-orange/25 bg-brand-orange-soft mx-4 mt-3 flex items-start gap-3 rounded-2xl border p-4 sm:mx-0"
    >
      <span className="bg-brand-orange/15 text-brand-orange flex size-9 shrink-0 items-center justify-center rounded-xl">
        <Clock className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-brand-orange text-sm font-medium">{headline}</p>
        {reason ? (
          <p className="text-brand-navy/70 text-xs leading-relaxed">
            They asked: &ldquo;{reason}&rdquo;
          </p>
        ) : (
          <p className="text-brand-navy/70 text-xs leading-relaxed">
            Reply in the thread to clear this, or mark it resolved if you
            already handled it offline.
          </p>
        )}
      </div>
      <MarkResolvedButton conversationId={conversationId} />
    </div>
  );
}
