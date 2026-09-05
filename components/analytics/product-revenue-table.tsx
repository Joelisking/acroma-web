"use client"

import { Fragment } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatMoney } from "@/lib/format"
import type { ProductRevenueRow } from "@/lib/api/types"

type Props = { products: ProductRevenueRow[]; currency: string }

export function ProductRevenueTable({ products, currency }: Props) {
  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No revenue in this period yet.
      </p>
    )
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
            <Fragment key={p.productId ?? `name:${p.name}`}>
              <TableRow>
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

              {/* How the product's units split across its choices, e.g. of 100
                  King Combos, 50 Pork and 50 Gizzard. Indented under the
                  product because these are a breakdown of the row above, not
                  products in their own right. */}
              {(p.variants ?? []).map((v) => (
                <TableRow
                  key={`${p.productId ?? p.name}:${v.label ?? "unspecified"}`}
                  className="border-0 hover:bg-transparent"
                >
                  <TableCell className="py-1 pl-6 text-sm font-normal text-muted-foreground">
                    {v.label ?? "Not specified"}
                  </TableCell>
                  <TableCell className="py-1 text-right text-sm text-muted-foreground tabular-nums">
                    {formatMoney(v.revenue, currency)}
                  </TableCell>
                  <TableCell className="py-1 text-right text-sm text-muted-foreground tabular-nums">
                    {v.unitsSold}
                  </TableCell>
                  <TableCell className="py-1" />
                  <TableCell className="py-1 text-right text-sm text-muted-foreground tabular-nums">
                    {v.pctOfProduct}%
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
