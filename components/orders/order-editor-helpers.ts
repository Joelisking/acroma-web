import type { Order, OrderLineInput } from "@/lib/api/types";
import type { EditableLine } from "./order-line-row";

export function newKey() {
  return Math.random().toString(36).slice(2);
}

export function linesFromOrder(order: Order): EditableLine[] {
  return order.items.map((item) =>
    item.product
      ? {
          key: newKey(),
          kind: "catalog" as const,
          productId: item.product.id,
          productName: item.product.name,
          variantId: item.variantId ?? undefined,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        }
      : {
          key: newKey(),
          kind: "custom" as const,
          customName: item.productName ?? "Item",
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        },
  );
}

export function toLineInput(line: EditableLine): OrderLineInput | null {
  if (line.kind === "catalog") {
    if (!line.productId) return null;
    return {
      productId: line.productId,
      ...(line.variantId ? { variantId: line.variantId } : {}),
      quantity: line.quantity,
    };
  }
  if (!line.customName.trim() || line.unitPrice <= 0) return null;
  return {
    customName: line.customName.trim(),
    unitPrice: line.unitPrice,
    quantity: line.quantity,
  };
}
