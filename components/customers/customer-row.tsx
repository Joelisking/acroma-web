import type { Customer } from "@/lib/api/types";
import { formatPhone } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { OptOutToggle } from "./opt-out-toggle";

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function CustomerRow({ customer }: { customer: Customer }) {
  return (
    <div className="border-border/70 bg-card grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-foreground truncate text-sm font-medium">
            {customer.name?.trim() || formatPhone(customer.phone)}
          </p>
          {customer.optedOut ? (
            <Badge className="bg-muted text-muted-foreground text-xs">
              Opted out
            </Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {formatPhone(customer.phone)} · last chat {formatRelative(customer.lastMessageAt)} · last order {formatRelative(customer.lastOrderAt)}
        </p>
      </div>
      <OptOutToggle id={customer.id} optedOut={customer.optedOut} />
    </div>
  );
}
