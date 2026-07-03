"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { getProductRevenueAction } from "@/lib/api/analytics-actions";
import type { AnalyticsFilter, ProductRevenueReport } from "@/lib/api/types";

function isFetchable(f: AnalyticsFilter): boolean {
  if (f.range !== "CUSTOM") return true;
  return Boolean(f.startDate && f.endDate);
}

export function useProductRevenue(
  initialFilter: AnalyticsFilter,
  initialReport: ProductRevenueReport,
) {
  const [filter, setFilter] = useState<AnalyticsFilter>(initialFilter);
  const [report, setReport] = useState<ProductRevenueReport>(initialReport);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const requestId = useRef(0);

  const applyFilter = useCallback((next: AnalyticsFilter) => {
    setFilter(next);
    if (!isFetchable(next)) return;
    const id = ++requestId.current;
    startTransition(async () => {
      const res = await getProductRevenueAction(next);
      if (id !== requestId.current) return;
      if (res.ok) {
        setReport(res.data);
        setError(null);
      } else {
        setError(res.error);
      }
    });
  }, []);

  return { filter, report, error, isPending, applyFilter };
}
