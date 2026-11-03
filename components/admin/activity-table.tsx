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
import { formatDateTime } from "@/lib/admin/format";
import type { ActivityEntry } from "@/lib/admin/types";

/**
 * `mutation` rows are written before the handler runs, so they record a
 * confirmed attempt, not a completed change.
 */
function describe(a: ActivityEntry): { label: string; text: string } {
  if (a.action === "mutation") {
    return { label: "Confirmed attempt", text: `Confirmed: ${a.summary}` };
  }
  return { label: a.action, text: a.summary };
}

export function ActivityTable({ items }: { items: ActivityEntry[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No admin activity yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Admin</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Detail</TableHead>
          <TableHead>Merchant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((a) => {
          const d = describe(a);
          return (
            <TableRow key={a.id}>
              <TableCell className="whitespace-nowrap">{formatDateTime(a.createdAt)}</TableCell>
              <TableCell>{a.adminName}</TableCell>
              <TableCell>
                <Badge variant="outline">{d.label}</Badge>
              </TableCell>
              <TableCell className="whitespace-normal break-words">{d.text}</TableCell>
              <TableCell>
                {a.businessId ? (
                  <Link
                    href={`/admin/businesses/${a.businessId}`}
                    className="text-brand-blue hover:underline"
                  >
                    {a.businessName ?? "Unknown"}
                  </Link>
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
