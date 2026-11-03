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
import type { AuditEntry } from "@/lib/admin/types";

type AdminHref = (impersonatorId: string) => string;

function Actor({ entry, adminHref }: { entry: AuditEntry; adminHref?: AdminHref }) {
  if (entry.impersonatorName && entry.impersonatorId) {
    const name = <em>{entry.impersonatorName}</em>;
    return (
      <span>
        Owner, via{" "}
        {adminHref ? (
          <Link
            href={adminHref(entry.impersonatorId)}
            className="text-brand-blue hover:underline"
            title="Show only this admin's changes"
          >
            {name}
          </Link>
        ) : (
          name
        )}
      </span>
    );
  }
  if (entry.impersonatorId) {
    return (
      <span>
        Owner, via <em>an admin</em>
      </span>
    );
  }
  return (
    <span>
      {entry.actor}
      {entry.actorName ? ` (${entry.actorName})` : ""}
    </span>
  );
}

type Props = {
  items: AuditEntry[];
  /** Link target for an admin's name, e.g. this page filtered to that admin. */
  adminHref?: AdminHref;
};

export function AuditTable({ items, adminHref }: Props) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No audit entries found.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Summary</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((e) => (
          <TableRow key={e.id}>
            <TableCell className="whitespace-nowrap">{formatDateTime(e.createdAt)}</TableCell>
            <TableCell>
              <Actor entry={e} adminHref={adminHref} />
            </TableCell>
            <TableCell>
              <Badge variant="outline">{e.eventType}</Badge>
            </TableCell>
            <TableCell className="break-words whitespace-normal">{e.summary}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
