import { BanknoteIcon, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReceiptStatus, ReceiptTone } from "@/lib/receipt-status";

const TONE: Record<
  ReceiptTone,
  { classes: string; icon: typeof CheckCircle2 }
> = {
  paid: {
    classes: "bg-brand-green-soft text-brand-green",
    icon: CheckCircle2,
  },
  pending: {
    classes: "bg-brand-orange-soft text-brand-orange",
    icon: Clock,
  },
  cash: {
    classes: "bg-brand-blue-soft text-brand-blue",
    icon: BanknoteIcon,
  },
  failed: {
    classes: "bg-destructive/10 text-destructive",
    icon: XCircle,
  },
};

export function StatusPill({ status }: { status: ReceiptStatus }) {
  const { classes, icon: Icon } = TONE[status.tone];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1",
        "text-xs font-semibold tracking-wide",
        classes,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {status.label}
    </span>
  );
}
