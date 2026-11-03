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
import type { LogGroup } from "@/lib/admin/types";

export function ErrorGroups({ groups }: { groups: LogGroup[] }) {
  if (groups.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No warnings or errors in this period.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">Count</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Context</TableHead>
          <TableHead>Message</TableHead>
          <TableHead className="text-right">Merchants</TableHead>
          <TableHead>Last seen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((g) => (
          <TableRow key={`${g.level}|${g.context ?? ""}|${g.message}`}>
            <TableCell className="text-right font-medium tabular-nums">{g.count}</TableCell>
            <TableCell>
              <Badge variant={g.level === "error" ? "destructive" : "outline"}>{g.level}</Badge>
            </TableCell>
            <TableCell>{g.context ?? "-"}</TableCell>
            <TableCell className="whitespace-normal break-words">{g.message}</TableCell>
            <TableCell className="text-right tabular-nums">{g.businesses}</TableCell>
            <TableCell className="whitespace-nowrap">{formatDateTime(g.lastAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
