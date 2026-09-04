"use client"

import dynamic from "next/dynamic"
import { AnalyticsFilterBar } from "./analytics-filter-bar"
import { ProductRevenueTable } from "./product-revenue-table"
import { RevenueSplit } from "./revenue-split"
import { useProductRevenue } from "./use-product-revenue"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { AnalyticsFilter, ProductRevenueReport } from "@/lib/api/types"

const ChartSkeleton = () => (
  <div className="h-[260px] w-full animate-pulse rounded-lg bg-muted" />
)

const BarChart = dynamic(
  () =>
    import("./product-revenue-bar-chart").then((m) => m.ProductRevenueBarChart),
  { ssr: false, loading: ChartSkeleton }
)
const TrendChart = dynamic(
  () =>
    import("./product-revenue-trend-chart").then(
      (m) => m.ProductRevenueTrendChart
    ),
  { ssr: false, loading: ChartSkeleton }
)

type Props = {
  initialFilter: AnalyticsFilter
  initialReport: ProductRevenueReport
}

export function AnalyticsView({ initialFilter, initialReport }: Props) {
  const { filter, report, error, isPending, applyFilter } = useProductRevenue(
    initialFilter,
    initialReport
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total revenue · {report.range.label}
            </p>
            <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              {formatMoney(report.totalRevenue, report.currency)}
            </p>
          </div>
          {report.revenueByMethod ? (
            <RevenueSplit
              paystack={report.revenueByMethod.paystack}
              cash={report.revenueByMethod.cash}
              currency={report.currency}
              className="max-w-md"
            />
          ) : null}
        </div>
        <AnalyticsFilterBar filter={filter} onChange={applyFilter} />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <section
        className={cn(
          "rounded-xl border bg-card p-4",
          isPending && "opacity-60"
        )}
        aria-label="Product revenue breakdown"
      >
        <ProductRevenueTable
          products={report.products}
          currency={report.currency}
        />
      </section>

      <div
        className={cn("grid gap-6 lg:grid-cols-2", isPending && "opacity-60")}
      >
        <section
          className="rounded-xl border bg-card p-4"
          aria-label="Revenue by product"
        >
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Top products
          </h2>
          <BarChart products={report.products} currency={report.currency} />
        </section>

        <section
          className="rounded-xl border bg-card p-4"
          aria-label="Revenue over time"
        >
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Revenue over time
          </h2>
          <TrendChart
            series={report.series}
            seriesKeys={report.seriesKeys}
            currency={report.currency}
            bucket={report.bucket}
          />
        </section>
      </div>
    </div>
  )
}
