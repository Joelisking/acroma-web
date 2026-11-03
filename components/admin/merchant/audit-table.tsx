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

function Actor({ entry }: { entry: AuditEntry }) {
  if (entry.impersonatorName) {
    return (
      <span>
        Owner, via <em>{entry.impersonatorName}</em>
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

export function AuditTable({ items }: { items: AuditEntry[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No audit entries found.</p>;
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
              <Actor entry={e} />
            </TableCell>
            <TableCell>
              <Badge variant="outline">{e.eventType}</Badge>
            </TableCell>
            <TableCell className="whitespace-normal break-words">{e.summary}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
