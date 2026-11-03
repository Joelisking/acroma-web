import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatUsd } from "@/lib/admin/format";
import type { AiDecision } from "@/lib/admin/types";

export function AiDecisionsTable({ items }: { items: AiDecision[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No AI decisions found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Conversation</TableHead>
          <TableHead>Mode</TableHead>
          <TableHead>Route</TableHead>
          <TableHead>Turn type</TableHead>
          <TableHead>Outcome</TableHead>
          <TableHead className="text-right">Latency</TableHead>
          <TableHead className="text-right">Cost (USD)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((d) => (
          <TableRow key={d.id}>
            <TableCell>{formatDateTime(d.createdAt)}</TableCell>
            <TableCell className="font-mono text-xs">{d.conversationId.slice(0, 8)}</TableCell>
            <TableCell>
              <Badge variant="outline">{d.mode}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={d.route === "STRONG" ? "secondary" : "outline"}>{d.route}</Badge>
            </TableCell>
            <TableCell>
              {d.jevTurnType ?? "-"}
              {d.jevConfidence !== null ? (
                <span className="ml-1 text-xs text-muted-foreground">
                  {Math.round(d.jevConfidence * 100)}%
                </span>
              ) : null}
            </TableCell>
            <TableCell className="max-w-48 truncate">
              {d.guardFailed ? `Guard: ${d.guardFailed}` : (d.strongAction ?? d.cheapOutcome ?? "-")}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {d.jevLatencyMs !== null ? `${d.jevLatencyMs} ms` : "-"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {d.costUsd !== null ? formatUsd(d.costUsd * 1_000_000) : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
