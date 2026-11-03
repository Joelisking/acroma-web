import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/admin/format";
import type { MerchantRow } from "@/lib/admin/types";

function YesNo({ value }: { value: boolean }) {
  return <Badge variant={value ? "secondary" : "outline"}>{value ? "Yes" : "No"}</Badge>;
}

export function MerchantTable({ items }: { items: MerchantRow[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No merchants found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Merchant</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>WhatsApp</TableHead>
          <TableHead>Paystack</TableHead>
          <TableHead className="text-right">Orders 7d</TableHead>
          <TableHead>Last customer message</TableHead>
          <TableHead className="text-right">Errors 24h</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <Link
                href={`/admin/businesses/${m.id}`}
                className="font-medium text-brand-blue hover:underline"
              >
                {m.name}
              </Link>
              <div className="text-xs text-muted-foreground">{m.email}</div>
            </TableCell>
            <TableCell>{m.businessType}</TableCell>
            <TableCell>{formatDate(m.createdAt)}</TableCell>
            <TableCell>
              <YesNo value={m.whatsappConnected} />
            </TableCell>
            <TableCell>
              <YesNo value={m.paystackConfigured} />
            </TableCell>
            <TableCell className="text-right tabular-nums">{m.orders7d}</TableCell>
            <TableCell>{formatDateTime(m.lastCustomerMessageAt)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {m.errors24h > 0 ? (
                <Badge variant="destructive">{m.errors24h}</Badge>
              ) : (
                m.errors24h
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
