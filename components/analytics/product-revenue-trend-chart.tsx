"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/format";
import type { ProductRevenueSeriesPoint } from "@/lib/api/types";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

type Props = {
  series: ProductRevenueSeriesPoint[];
  seriesKeys: string[];
  currency: string;
  bucket: "hour" | "day";
};

function tickLabel(iso: string, bucket: "hour" | "day"): string {
  const d = new Date(iso);
  return bucket === "hour"
    ? d.toLocaleTimeString(undefined, { hour: "numeric" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ProductRevenueTrendChart({
  series,
  seriesKeys,
  currency,
  bucket,
}: Props) {
  if (seriesKeys.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        No revenue in this period yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={series} margin={{ left: 8, right: 16, top: 8 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="bucket"
          tickFormatter={(v: string) => tickLabel(v, bucket)}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          labelFormatter={(v) => tickLabel(String(v), bucket)}
          formatter={(value) => formatMoney(Number(value), currency)}
        />
        {seriesKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
