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

import { formatTokens, microUsdToUsd } from "@/lib/admin/format";

export interface UsageDailyPoint {
  date: string;
  costMicroUsd: number;
  totalTokens: number;
}

type Props = {
  daily: UsageDailyPoint[];
};

function tickLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const usdAxisFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function UsageTrendChart({ daily }: Props) {
  const hasData =
    daily.length > 0 &&
    daily.some((d) => d.costMicroUsd > 0 || d.totalTokens > 0);

  if (!hasData) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        No usage in this period yet.
      </p>
    );
  }

  const series = daily.map((d) => ({
    date: d.date,
    cost: microUsdToUsd(d.costMicroUsd),
    tokens: d.totalTokens,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={series} margin={{ left: 8, right: 8, top: 8 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={tickLabel}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          yAxisId="cost"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v: number) => usdAxisFormatter.format(v)}
        />
        <YAxis
          yAxisId="tokens"
          orientation="right"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v: number) => formatTokens(v)}
        />
        <Tooltip
          labelFormatter={(v) => tickLabel(String(v))}
          formatter={(value, name) =>
            name === "Cost"
              ? usdAxisFormatter.format(Number(value))
              : formatTokens(Number(value))
          }
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Line
          yAxisId="cost"
          name="Cost"
          type="monotone"
          dataKey="cost"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="tokens"
          name="Tokens"
          type="monotone"
          dataKey="tokens"
          stroke="var(--chart-2)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
