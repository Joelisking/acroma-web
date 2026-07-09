import "server-only";

import { apiFetch } from "./server";
import type { Order, OrderStatus } from "./types";

export async function listOrders(opts?: {
  status?: OrderStatus;
  from?: string;
  to?: string;
  /** When true, returns only removed (archived) orders instead of the live list. */
  archived?: boolean;
}): Promise<Order[]> {
  const qs = new URLSearchParams();
  if (opts?.status) qs.set("status", opts.status);
  if (opts?.from) qs.set("from", opts.from);
  if (opts?.to) qs.set("to", opts.to);
  if (opts?.archived) qs.set("archived", "true");
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<Order[]>(`/orders${suffix}`);
}

export async function getOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}
