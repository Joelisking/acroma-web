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

export const listMerchants = (p: Params) =>
  adminFetch<Page<MerchantRow>>(`${base}/businesses`, { searchParams: p });

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
  adminFetch<Page<AiDecision>>(`${base}/businesses/${id}/ai-decisions`, {
    searchParams: p,
  });

export const listAudit = (id: string, p: Params) =>
  adminFetch<Page<AuditEntry>>(`${base}/businesses/${id}/audit`, { searchParams: p });

export const listMerchantLogs = (id: string, p: Params) =>
  adminFetch<Page<AppLogEntry>>(`${base}/businesses/${id}/logs`, { searchParams: p });

export const listLogGroups = (p: Params) =>
  adminFetch<LogGroup[]>(`${base}/logs/groups`, { searchParams: p });

export const listActivity = (p: Params) =>
  adminFetch<Page<ActivityEntry>>(`${base}/activity`, { searchParams: p });
