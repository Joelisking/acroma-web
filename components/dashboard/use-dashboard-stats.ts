"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import {
  getDashboardStatsAction,
  setDefaultDashboardFilterAction,
} from "@/lib/api/dashboard-actions";
import type { DashboardFilter, DashboardStats } from "@/lib/api/types";

const FILTER_KEYS: (keyof DashboardFilter)[] = [
  "range",
  "startDate",
  "endDate",
  "orderStatus",
  "conversationStatus",
  "customerSegment",
  "customerPhone",
  "compare",
];

/** Structural equality for two filters — key-order independent. */
function filtersEqual(a: DashboardFilter, b: DashboardFilter): boolean {
  return FILTER_KEYS.every((k) => a[k] === b[k]);
}

/** A CUSTOM filter with no dates yet is not ready to fetch. */
function isFetchable(filter: DashboardFilter): boolean {
  if (filter.range !== "CUSTOM") return true;
  return Boolean(filter.startDate && filter.endDate);
}

export function useDashboardStats(
  initialFilter: DashboardFilter,
  initialStats: DashboardStats,
) {
  const [filter, setFilter] = useState<DashboardFilter>(initialFilter);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [error, setError] = useState<string | null>(null);
  const [savedDefault, setSavedDefault] = useState<DashboardFilter>(
    initialFilter,
  );
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaving] = useTransition();

  // Guards against a slow earlier request overwriting a newer one.
  const requestId = useRef(0);

  const applyFilter = useCallback((next: DashboardFilter) => {
    setFilter(next);
    if (!isFetchable(next)) return;
    const id = ++requestId.current;
    startTransition(async () => {
      const res = await getDashboardStatsAction(next);
      if (id !== requestId.current) return;
      if (res.ok) {
        setStats(res.data);
        setError(null);
      } else {
        setError(res.error);
      }
    });
  }, []);

  const saveDefault = useCallback(() => {
    startSaving(async () => {
      const res = await setDefaultDashboardFilterAction(filter);
      if (res.ok) setSavedDefault(filter);
      else setError(res.error);
    });
  }, [filter]);

  const isDefault = filtersEqual(filter, savedDefault);

  return {
    filter,
    stats,
    error,
    isPending,
    isSaving,
    isDefault,
    applyFilter,
    saveDefault,
  };
}
