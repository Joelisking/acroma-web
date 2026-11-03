import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import { AdminApiError, adminFetch } from "./api";
import type {
  ActivityEntry,
  AiDecision,
  AppLogEntry,
  AuditEntry,
  LogGroup,
  MerchantDetail,
  MerchantRow,
  Page,
} from "./types";

export type Params = Record<string, string | undefined>;

const base = "/super-admin";

/**
 * A paged list. A stale or hand-edited `cursor` makes the backend answer 400;
 * that is treated as "start over" (first page) rather than an error page.
 */
async function paged<T>(path: string, p: Params): Promise<Page<T>> {
  try {
    return await adminFetch<Page<T>>(path, { searchParams: p });
  } catch (err) {
    if (p.cursor && err instanceof AdminApiError && err.status === 400) {
      return adminFetch<Page<T>>(path, {
        searchParams: { ...p, cursor: undefined },
      });
    }
    throw err;
  }
}

export const listMerchants = (p: Params) => paged<MerchantRow>(`${base}/businesses`, p);

/** Cached per request so the layout and the Overview tab share one call. */
export const getMerchant = cache(async (id: string): Promise<MerchantDetail> => {
  try {
    return await adminFetch<MerchantDetail>(`${base}/businesses/${id}`);
  } catch (err) {
    if (err instanceof AdminApiError && (err.status === 404 || err.status === 400)) {
      notFound();
    }
    throw err;
  }
});

export const listAiDecisions = (id: string, p: Params) =>
  paged<AiDecision>(`${base}/businesses/${id}/ai-decisions`, p);

export const listAudit = (id: string, p: Params) =>
  paged<AuditEntry>(`${base}/businesses/${id}/audit`, p);

export const listMerchantLogs = (id: string, p: Params) =>
  paged<AppLogEntry>(`${base}/businesses/${id}/logs`, p);

export const listLogGroups = (p: Params) =>
  adminFetch<LogGroup[]>(`${base}/logs/groups`, { searchParams: p });

export const listActivity = (p: Params) => paged<ActivityEntry>(`${base}/activity`, p);
