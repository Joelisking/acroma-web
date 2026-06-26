import { Ticket } from "lucide-react";
import { ListRow } from "@/components/shared/list-row";
import { StatusPill, type PillTone } from "@/components/shared/status-pill";
import type { Discount } from "@/lib/api/types";

function formatValue(d: Discount, currency: string): string {
  if (d.type === "PERCENTAGE") return `${d.value}% off`;
  return `${currency} ${d.value.toFixed(2)} off`;
}

function statusOf(d: Discount): { label: string; tone: PillTone } {
  if (!d.isActive) return { label: "Paused", tone: "muted" };
  const now = Date.now();
  if (d.validUntil && new Date(d.validUntil).getTime() <= now) {
    return { label: "Expired", tone: "muted" };
  }
  if (d.totalUsageLimit !== null && d.usageCount >= d.totalUsageLimit) {
    return { label: "Used up", tone: "muted" };
  }
  return { label: "Active", tone: "green" };
}

export function DiscountRow({
  discount,
  currency,
}: {
  discount: Discount;
  currency: string;
}) {
  const status = statusOf(discount);
  const usage =
    discount.totalUsageLimit !== null
      ? `${discount.usageCount} / ${discount.totalUsageLimit}`
      : `${discount.usageCount}`;

  return (
    <ListRow
      className="card-warm"
      href={`/dashboard/discounts/${discount.id}`}
      showChevron
      leading={
        <span className="bg-brand-orange-soft text-brand-orange flex size-10 items-center justify-center rounded-xl">
          <Ticket className="size-5" strokeWidth={2} />
        </span>
      }
      title={
        <span className="flex items-center gap-2">
          <code className="font-mono">{discount.code}</code>
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
        </span>
      }
      subtitle={
        <>
          {formatValue(discount, currency)} · used {usage}
        </>
      }
    />
  );
}
