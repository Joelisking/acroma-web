import "server-only";

import { apiFetch } from "./server";
import type { AuditEntry } from "./types";

/**
 * Server-side reads for the audit log (`GET /audit`).
 *
 * Read-only — the audit log is never mutated from the dashboard. Rows are
 * scoped to the logged-in business by the backend and returned newest first.
 */

type ListAuditParams = {
  conversationId?: string;
  orderId?: string;
  cursor?: string;
};

export async function listAudit(
  params: ListAuditParams = {},
): Promise<AuditEntry[]> {
  const qs = new URLSearchParams();
  if (params.conversationId) qs.set("conversationId", params.conversationId);
  if (params.orderId) qs.set("orderId", params.orderId);
  if (params.cursor) qs.set("cursor", params.cursor);

  const query = qs.toString();
  return apiFetch<AuditEntry[]>(`/audit${query ? `?${query}` : ""}`);
}
