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
import type { AppLogEntry } from "@/lib/admin/types";

export function LogsTable({ items }: { items: AppLogEntry[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No logs found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Context</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Route</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((l) => (
          <TableRow key={l.id}>
            <TableCell className="whitespace-nowrap">{formatDateTime(l.createdAt)}</TableCell>
            <TableCell>
              <Badge variant={l.level === "error" ? "destructive" : "outline"}>{l.level}</Badge>
            </TableCell>
            <TableCell>{l.context ?? "-"}</TableCell>
            <TableCell className="whitespace-normal break-words">{l.message}</TableCell>
            <TableCell className="font-mono text-xs">{l.route ?? "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
