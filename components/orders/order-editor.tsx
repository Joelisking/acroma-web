"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoSheet } from "@/components/shared/info-sheet";
import { formatMoney, formatPhone } from "@/lib/format";
import { createOrderAction, editOrderAction } from "@/lib/api/orders-actions";
import type {
  Business,
  Order,
  OrderFulfillment,
  OrderLineInput,
  PaymentMethod,
  Product,
} from "@/lib/api/types";
import { OrderLineRow, type EditableLine } from "./order-line-row";
import { newKey, linesFromOrder, toLineInput } from "./order-editor-helpers";

type OrderEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: Business;
  products: Product[];
  onDone?: (order: Order) => void;
} & (
  | { mode: "create"; customerPhone: string; customerName?: string | null }
  | { mode: "edit"; order: Order }
);

/**
 * One sheet, two modes: author a brand-new order (from a conversation) or
 * edit an unpaid order's line items. Recomputes the total client-side for
 * display only — the backend is the source of truth for pricing.
 */
export function OrderEditor(props: OrderEditorProps) {
  const { open, onOpenChange, business, products, onDone } = props;
  const isEdit = props.mode === "edit";

  const [lines, setLines] = React.useState<EditableLine[]>(() =>
    isEdit ? linesFromOrder(props.order) : [],
  );
  const [fulfillment, setFulfillment] = React.useState<OrderFulfillment>(
    isEdit ? props.order.fulfillment : "DELIVERY",
  );
  const [deliveryAddress, setDeliveryAddress] = React.useState(
    isEdit ? (props.order.deliveryAddress ?? "") : "",
  );
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(
    isEdit ? props.order.paymentMethod : "MOMO",
  );
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    // Resync local editor state from props every time the sheet reopens.
    /* eslint-disable react-hooks/set-state-in-effect */
    setLines(isEdit ? linesFromOrder(props.order) : []);
    setFulfillment(isEdit ? props.order.fulfillment : "DELIVERY");
    setDeliveryAddress(isEdit ? (props.order.deliveryAddress ?? "") : "");
    setPaymentMethod(isEdit ? props.order.paymentMethod : "MOMO");
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const lineInputs = lines.map(toLineInput);
  const cartValid = lineInputs.length > 0 && lineInputs.every(Boolean);
  const addressValid = fulfillment === "PICKUP" || deliveryAddress.trim().length > 0;
  const canSubmit = cartValid && addressValid && !pending;

  function addCatalogLine() {
    setLines((prev) => [
      ...prev,
      { key: newKey(), kind: "catalog", productId: "", productName: "", unitPrice: 0, quantity: 1 },
    ]);
  }
  function addCustomLine() {
    setLines((prev) => [
      ...prev,
      { key: newKey(), kind: "custom", customName: "", unitPrice: 0, quantity: 1 },
    ]);
  }
  function updateLine(key: string, next: EditableLine) {
    setLines((prev) => prev.map((l) => (l.key === key ? next : l)));
  }
  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    const items = lineInputs.filter((l): l is OrderLineInput => l !== null);

    const result = isEdit
      ? await editOrderAction(props.order.id, {
          items,
          fulfillment,
          deliveryAddress: fulfillment === "PICKUP" ? undefined : deliveryAddress.trim(),
        })
      : await createOrderAction({
          customerPhone: props.customerPhone,
          customerName: props.customerName ?? undefined,
          fulfillment,
          deliveryAddress: fulfillment === "PICKUP" ? undefined : deliveryAddress.trim(),
          paymentMethod,
          items,
        });

    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onOpenChange(false);
    onDone?.(result.data);
  }

  const customerLabel = isEdit
    ? (props.order.customerName?.trim() || formatPhone(props.order.customerPhone))
    : (props.customerName?.trim() || formatPhone(props.customerPhone));

  return (
    <InfoSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit order" : "Create order"}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-foreground text-lg font-bold tracking-tight">
            {isEdit ? "Edit order" : "Create order"}
          </p>
          <p className="text-muted-foreground mt-0.5 text-sm">{customerLabel}</p>

          <div className="mt-5 flex flex-col gap-3">
            {lines.map((line) => (
              <OrderLineRow
                key={line.key}
                line={line}
                products={products}
                currency={business.currency}
                onChange={(next) => updateLine(line.key, next)}
                onRemove={() => removeLine(line.key)}
              />
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addCatalogLine}>
              <Plus className="size-4" /> Add catalog item
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addCustomLine}>
              <Plus className="size-4" /> Add custom item
            </Button>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {business.acceptsPickup ? (
              <Select value={fulfillment} onValueChange={(v) => setFulfillment(v as OrderFulfillment)}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DELIVERY">Delivery</SelectItem>
                  <SelectItem value="PICKUP">Pickup</SelectItem>
                </SelectContent>
              </Select>
            ) : null}

            {fulfillment === "DELIVERY" ? (
              <Textarea
                placeholder="Delivery address"
                rows={3}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            ) : null}

            {!isEdit && business.acceptsCashOnDelivery ? (
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOMO">Mobile money</SelectItem>
                  <SelectItem value="CASH_ON_DELIVERY">Cash on delivery</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
          </div>
        </div>

        <div className="border-border/70 bg-background sticky bottom-0 border-t p-4">
          {error ? <p className="text-destructive mb-2 text-sm">{error}</p> : null}
          <div className="mb-2 flex items-center justify-between text-sm font-medium">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(subtotal, business.currency)}</span>
          </div>
          <Button type="button" className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
            {pending ? "Saving..." : isEdit ? "Save changes" : "Create order"}
          </Button>
        </div>
      </div>
    </InfoSheet>
  );
}
