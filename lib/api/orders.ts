import "server-only";

import { apiFetch } from "./server";
import type { Order, OrderStatus } from "./types";

export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  const qs = status ? `?status=${status}` : "";
  return apiFetch<Order[]>(`/orders${qs}`);
}

export async function getOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}
