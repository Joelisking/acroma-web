import { Clock, PackagePlus, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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

type ReasonContent = {
  Icon: LucideIcon;
  headline: string;
  body: string;
  cta?: { label: string; href: string };
};

/**
 * Known system escalation slugs. The backend stores these in
 * `escalationReason` for hand-offs that are NOT a real customer question
 * (a setup gap, a safety stop), so we render purpose-built, actionable copy
 * instead of leaking the raw slug as "They asked: '<slug>'". Anything not in
 * this map is treated as a genuine free-text customer ask.
 */
const REASON_CONTENT: Record<string, ReasonContent> = {
  "empty-catalog": {
    Icon: PackagePlus,
    headline: "Add items to start selling",
    body: "A customer just messaged, but your catalog is empty, so Acroma can't take orders yet. Add your first items and Acroma will start replying automatically.",
    cta: { label: "Add items", href: "/dashboard/catalog" },
  },
  "ungrounded-claim": {
    Icon: Clock,
    headline: "A question Acroma couldn't answer safely",
    body: "Acroma wasn't sure of the answer and didn't want to guess. Reply in the thread to help your customer.",
  },
  "cancel-ambiguous": {
    Icon: Clock,
    headline: "A customer wants to cancel an order",
    body: "They have more than one open order, so Acroma needs you to confirm which one. Reply in the thread to sort it out.",
  },
  "cancel-after-payment": {
    Icon: Clock,
    headline: "A customer wants to cancel a paid order",
    body: "They already paid, so Acroma handed this to you. Reply in the thread to handle the refund or change.",
  },
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

  const reason = escalationReason?.trim();
  const mapped = reason ? REASON_CONTENT[reason] : undefined;

  const Icon = mapped?.Icon ?? Clock;
  const headline = mapped
    ? mapped.headline
    : aiHoldingLine
      ? "Acroma is holding the line while you reply."
      : "Your customer is waiting on a reply.";

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-brand-orange/25 bg-brand-orange-soft mx-4 mt-3 flex flex-col gap-3 rounded-2xl border p-4 sm:mx-0 sm:flex-row sm:items-start"
    >
      <div className="flex min-w-0 items-start gap-3 sm:flex-1">
        <span className="bg-brand-orange/15 text-brand-orange flex size-9 shrink-0 items-center justify-center rounded-xl">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-brand-orange text-sm font-medium">{headline}</p>
          {mapped ? (
            <p className="text-brand-navy/70 text-xs leading-relaxed">
              {mapped.body}
            </p>
          ) : reason ? (
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
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
        {mapped?.cta ? (
          <Button asChild size="sm" className="gap-1.5">
            <Link href={mapped.cta.href}>
              <PackagePlus className="size-4" />
              {mapped.cta.label}
            </Link>
          </Button>
        ) : null}
        <MarkResolvedButton conversationId={conversationId} />
      </div>
    </div>
  );
}
