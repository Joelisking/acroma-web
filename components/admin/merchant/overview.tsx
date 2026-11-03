import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime, formatUsd } from "@/lib/admin/format";
import type { AppLogEntry, MerchantDetail } from "@/lib/admin/types";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function Integration({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      {label}
      <Badge variant={on ? "secondary" : "outline"}>{on ? "Connected" : "Not set up"}</Badge>
    </div>
  );
}

export function MerchantOverview({
  merchant: m,
  errors,
}: {
  merchant: MerchantDetail;
  errors: AppLogEntry[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Created {formatDate(m.createdAt)}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div>{m.email}</div>
          <div className="text-muted-foreground">{m.phone ?? "No phone"}</div>
          <div className="text-muted-foreground">Currency {m.currency}</div>
          <Integration label="WhatsApp" on={m.whatsappConnected} />
          <Integration label="Paystack" on={m.paystackConfigured} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last 30 days</CardTitle>
          <CardDescription>
            Last customer message {formatDateTime(m.lastCustomerMessageAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <Stat label="Orders (7d)" value={m.orders7d} />
            <Stat label="Orders (30d)" value={m.orders30d} />
            <Stat label="Conversations" value={m.conversations30d} />
            <Stat label="AI cost (USD)" value={formatUsd(m.aiCost30d.usd * 1_000_000)} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <CardDescription>{m.staffCount} staff</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {m.team.map((t) => (
                <TableRow key={t.email}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>{t.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent errors</CardTitle>
          <CardDescription>{m.errors24h} in the last 24h</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          {errors.length === 0 ? (
            <p className="text-muted-foreground">No warnings or errors logged.</p>
          ) : (
            errors.map((e) => (
              <div key={e.id}>
                <div className="flex items-center gap-2">
                  <Badge variant={e.level === "error" ? "destructive" : "outline"}>
                    {e.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(e.createdAt)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 break-words">{e.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
