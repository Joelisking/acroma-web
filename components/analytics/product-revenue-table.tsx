"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/lib/format";
import type { ProductRevenueRow } from "@/lib/api/types";

type Props = { products: ProductRevenueRow[]; currency: string };

export function ProductRevenueTable({ products, currency }: Props) {
  if (products.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No revenue in this period yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Units</TableHead>
            <TableHead className="text-right">Orders</TableHead>
            <TableHead className="text-right">% of total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.productId ?? `name:${p.name}`}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(p.revenue, currency)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {p.unitsSold}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {p.orderCount}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {p.pctOfTotal}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
