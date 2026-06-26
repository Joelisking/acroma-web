import type { Customer } from "@/lib/api/types";
import { formatPhone, getInitials } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ListRow } from "@/components/shared/list-row";
import { StatusPill } from "@/components/shared/status-pill";
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
    <ListRow
      className="card-warm"
      leading={
        <Avatar className="size-10">
          <AvatarFallback className="bg-brand-orange-soft text-brand-orange text-sm font-semibold">
            {getInitials(customer.name, "·")}
          </AvatarFallback>
        </Avatar>
      }
      title={
        <span className="flex items-center gap-2">
          <span className="truncate">{name}</span>
          {customer.optedOut ? (
            <StatusPill tone="muted">Opted out</StatusPill>
          ) : null}
        </span>
      }
      subtitle={
        <>
          {formatPhone(customer.phone)} · last chat{" "}
          {formatRelative(customer.lastMessageAt)} · last order{" "}
          {formatRelative(customer.lastOrderAt)}
        </>
      }
      trailing={<OptOutToggle id={customer.id} optedOut={customer.optedOut} />}
    />
  );
}
