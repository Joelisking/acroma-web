import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Jumps from an order to the WhatsApp conversation with that customer. The href
 * points at a server resolver (`orders/[id]/chat`) that maps the order's
 * customer phone to their conversation and redirects — orders carry no
 * conversation id, so the link can't be built here.
 *
 * `relative z-10` keeps it clickable above the stretched card-overlay link on
 * the order board (see `order-row.tsx`); harmless on the detail page.
 */
export function OrderChatButton({
  orderId,
  className,
  size = "sm",
  label = "Chat",
}: {
  orderId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  label?: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      size={size}
      className={cn("relative z-10", className)}
    >
      <Link
        href={`/dashboard/orders/${orderId}/chat`}
        aria-label="Open conversation with this customer"
      >
        <MessageCircle />
        {label}
      </Link>
    </Button>
  );
}
