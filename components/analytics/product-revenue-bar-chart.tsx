"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/format";
import type { ProductRevenueRow } from "@/lib/api/types";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type Props = { products: ProductRevenueRow[]; currency: string };

export function ProductRevenueBarChart({ products, currency }: Props) {
  const data = products.slice(0, 8);

  if (data.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        No revenue in this period yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--accent)" }}
          formatter={(value) => formatMoney(Number(value), currency)}
        />
        <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
