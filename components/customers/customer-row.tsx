import type { Customer } from "@/lib/api/types";
import { formatPhone, getInitials } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const name = customer.name?.trim() || formatPhone(customer.phone);
  return (
    <div className="card-calm flex items-center gap-3 p-3.5">
      <Avatar className="size-10 shrink-0">
        <AvatarFallback className="bg-brand-orange-soft text-brand-orange text-sm font-semibold">
          {getInitials(customer.name, "·")}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-foreground truncate text-[0.95rem] font-semibold">
            {name}
          </p>
          {customer.optedOut ? (
            <Badge className="bg-muted text-muted-foreground text-xs">
              Opted out
            </Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground mt-0.5 truncate text-xs">
          {formatPhone(customer.phone)} · last chat{" "}
          {formatRelative(customer.lastMessageAt)} · last order{" "}
          {formatRelative(customer.lastOrderAt)}
        </p>
      </div>
      <OptOutToggle id={customer.id} optedOut={customer.optedOut} />
    </div>
  );
}
