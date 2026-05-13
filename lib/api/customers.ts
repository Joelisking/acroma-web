import "server-only";
import { apiFetch } from "./server";
import type { Customer } from "./types";

export async function listCustomers(search?: string): Promise<Customer[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<Customer[]>(`/customers${qs}`);
}

export async function getCustomer(id: string): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}`);
}
