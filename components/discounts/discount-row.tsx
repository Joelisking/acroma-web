import Link from "next/link";
import { ChevronRight, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Discount } from "@/lib/api/types";

function formatValue(d: Discount, currency: string): string {
  if (d.type === "PERCENTAGE") return `${d.value}% off`;
  return `${currency} ${d.value.toFixed(2)} off`;
}

function statusOf(d: Discount): {
  label: string;
  tone: "active" | "paused" | "expired";
} {
  if (!d.isActive) return { label: "Paused", tone: "paused" };
  const now = Date.now();
  if (d.validUntil && new Date(d.validUntil).getTime() <= now) {
    return { label: "Expired", tone: "expired" };
  }
  if (d.totalUsageLimit !== null && d.usageCount >= d.totalUsageLimit) {
    return { label: "Used up", tone: "expired" };
  }
  return { label: "Active", tone: "active" };
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
    <Link
      href={`/dashboard/discounts/${discount.id}`}
      className="card-calm hover:border-brand-orange/40 flex items-center gap-3 p-3.5 transition-colors"
    >
      <span className="bg-brand-orange-soft text-brand-orange flex size-10 shrink-0 items-center justify-center rounded-xl">
        <Ticket className="size-5" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <code className="text-foreground font-mono text-sm font-semibold">
            {discount.code}
          </code>
          <Badge
            className={cn(
              "text-xs",
              status.tone === "active" && "bg-brand-green-soft text-brand-green",
              status.tone !== "active" && "bg-muted text-muted-foreground",
            )}
          >
            {status.label}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-0.5 truncate text-xs">
          {formatValue(discount, currency)} · used {usage}
        </p>
      </div>
      <ChevronRight className="text-muted-foreground/50 size-4 shrink-0" />
    </Link>
  );
}
