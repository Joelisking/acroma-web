"use client";

import Link from "next/link";
import {
  Phone,
  MapPin,
  Package,
  CalendarClock,
  AlertCircle,
  Navigation,
  StickyNote,
} from "lucide-react";
import type { BusinessType, Order } from "@/lib/api/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderCardAction } from "./order-card-action";
import { OrderChatButton } from "./order-chat-button";
import { CopyButton } from "@/components/ui/copy-button";
import { firstUrl } from "@/lib/linkify";
import {
  formatItemsSummary,
  formatMoney,
  formatPhone,
  formatRelativeShort,
  getInitials,
  shortId,
} from "@/lib/format";
import { formatAppointment } from "@/lib/format-datetime";

function isAppointmentPast(scheduledFor: string): boolean {
  return new Date(scheduledFor).getTime() < Date.now();
}

export function OrderRow({
  order,
  businessType,
  selectable,
  selected,
  onToggle,
  isOwner = true,
}: {
  order: Order;
  businessType?: BusinessType | null;
  // The chat link opens a conversation, which is owner-only at the API.
  isOwner?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: (id: string) => void;
}) {
  const customer =
    order.customerName?.trim() || formatPhone(order.customerPhone);
  const itemsSummary = formatItemsSummary(order.items);
  const isDelivery = order.fulfillment === "DELIVERY";
  const isServices = businessType === "SERVICES";
  const hasAddress = isDelivery && Boolean(order.deliveryAddress);
  // A delivery address can embed a maps link (e.g. a dropped Google Maps pin).
  // Surface a tappable "Map" affordance, and strip the raw URL from the visible
  // text so the compact row stays tidy.
  const mapUrl = hasAddress ? firstUrl(order.deliveryAddress as string) : null;
  const addressText = mapUrl
    ? (order.deliveryAddress as string).replace(mapUrl, "").trim() ||
      "Tap map for location"
    : order.deliveryAddress;
  const needsReview =
    isServices &&
    !!order.scheduledFor &&
    isAppointmentPast(order.scheduledFor) &&
    (order.status === "PENDING" || order.status === "PROCESSING");

  const meta = isServices
    ? null
    : `${isDelivery ? "Delivery" : "Pickup"} · ${formatRelativeShort(order.createdAt)}`;

  return (
    <div className="card-calm hover:border-brand-orange/40 relative p-4 transition-colors">
      {/* Stretched overlay link: tapping the card opens the order; the phone,
          map, and action controls below sit above it via z-10. */}
      <Link
        href={`/dashboard/orders/${order.id}`}
        aria-label={`Open order #${shortId(order.id)} for ${customer}`}
        className="focus-visible:ring-ring absolute inset-0 rounded-[inherit] focus-visible:ring-2 focus-visible:outline-none"
      />

      <div className="flex items-start gap-3">
        {selectable ? (
          <input
            type="checkbox"
            className="relative z-10 mt-1 size-5 shrink-0 accent-[var(--brand-orange)]"
            checked={!!selected}
            onChange={() => onToggle?.(order.id)}
            aria-label={`Select order ${shortId(order.id)}`}
          />
        ) : (
          <Avatar className="size-10 shrink-0">
            <AvatarFallback className="bg-brand-orange-soft text-brand-orange text-sm font-semibold">
              {getInitials(order.customerName, "·")}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-foreground truncate text-[0.95rem] font-semibold">
                {customer}
              </p>
              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                <span className="font-mono tracking-wider">
                  #{shortId(order.id)}
                </span>
                {meta ? ` · ${meta}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-foreground text-lg font-semibold tabular-nums">
                {formatMoney(order.totalAmount, order.currency)}
              </span>
              <OrderStatusBadge
                status={order.status}
                businessType={businessType}
                fulfillment={order.fulfillment}
              />
            </div>
          </div>

          {needsReview ? (
            <span className="bg-brand-orange-soft text-brand-orange mt-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium whitespace-nowrap">
              <AlertCircle className="size-3 shrink-0" />
              Did they show?
            </span>
          ) : null}

          {itemsSummary ? (
            <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
              {itemsSummary}
            </p>
          ) : null}

          {order.notes ? (
            <p className="text-foreground/75 mt-1.5 flex items-start gap-1.5 text-xs">
              <StickyNote className="mt-0.5 size-3 shrink-0" aria-hidden />
              <span className="line-clamp-2 break-words">{order.notes}</span>
            </p>
          ) : null}

          {order.scheduledFor ? (
            <span className="text-muted-foreground mt-1.5 inline-flex items-center gap-1 text-xs">
              <CalendarClock className="size-3.5" />
              {formatAppointment(order.scheduledFor)}
            </span>
          ) : null}

          <div className="bg-muted mt-3 flex flex-col gap-2 rounded-2xl p-3">
            <div className="flex items-center gap-2.5">
              <span className="bg-brand-orange-soft text-brand-orange flex size-7 shrink-0 items-center justify-center rounded-lg">
                <Phone className="size-3.5" />
              </span>
              <a
                href={`tel:${order.customerPhone}`}
                className="text-foreground hover:text-brand-orange relative z-10 text-xs font-medium tabular-nums"
              >
                {formatPhone(order.customerPhone)}
              </a>
              <div className="ml-auto flex items-center gap-1.5">
                <CopyButton
                  value={order.customerPhone}
                  label="Copy phone number"
                  className="relative z-10"
                />
                {isOwner ? <OrderChatButton orderId={order.id} /> : null}
              </div>
            </div>
            {/* Services happen in person at the merchant's location (the
                appointment time is shown above), so no pickup/delivery row. */}
            {isServices ? null : (
              <div className="flex items-start gap-2.5">
                <span className="bg-brand-blue-soft text-brand-blue flex size-7 shrink-0 items-center justify-center rounded-lg">
                  {isDelivery ? (
                    <MapPin className="size-3.5" />
                  ) : (
                    <Package className="size-3.5" />
                  )}
                </span>
                <p className="text-foreground min-w-0 text-xs leading-snug font-medium">
                  {isDelivery
                    ? addressText || "Address to confirm"
                    : "Customer pickup"}
                </p>
                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-brand-blue hover:text-brand-blue/80 relative z-10 inline-flex items-center gap-1 text-xs font-medium"
                    >
                      <Navigation className="size-3.5" />
                      Map
                    </a>
                  ) : null}
                  {hasAddress ? (
                    <CopyButton
                      value={order.deliveryAddress as string}
                      label="Copy delivery address"
                      className="relative z-10"
                    />
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <OrderCardAction
            order={order}
            businessType={businessType}
            className="mt-3"
          />
        </div>
      </div>
    </div>
  );
}
