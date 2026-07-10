"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUsd } from "@/lib/admin/format";

interface PerBusiness {
  businessId: string;
  episodes: number;
  costMicroUsd: number;
}

interface UsageReportData {
  from: string;
  to: string;
  episodeCount: number;
  paidEpisodeCount: number;
  avgCostMicroUsdPerEpisode: number;
  avgCostMicroUsdPerPaidEpisode: number;
  episodesPerPaidOrder: number;
  costByKind: Record<string, number>;
  perBusiness: PerBusiness[];
  note: string;
}

const PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

function rangeForDays(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function UsageReport() {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<UsageReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (selectedDays: number) => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = rangeForDays(selectedDays);
      const qs = new URLSearchParams({ from, to });
      const res = await fetch(`/api/admin/usage?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setError(`Couldn't load the report (${res.status}).`);
        setData(null);
        return;
      }
      setData((await res.json()) as UsageReportData);
    } catch {
      setError("Couldn't reach the server.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    // Defer so we never call setState synchronously in the effect body; the
    // guard drops a stale response if the range changes mid-flight.
    void (async () => {
      if (active) await load(days);
    })();
    return () => {
      active = false;
    };
  }, [days, load]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.days}
              variant={preset.days === days ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(preset.days)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          Log out
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => load(days)}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : data ? (
        <Report data={data} />
      ) : null}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  prominent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  prominent?: boolean;
}) {
  return (
    <Card className={prominent ? "ring-2 ring-primary/40" : undefined}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={
            prominent
              ? "font-heading text-3xl font-semibold"
              : "font-heading text-2xl font-medium"
          }
        >
          {value}
        </div>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Report({ data }: { data: UsageReportData }) {
  const kinds = Object.entries(data.costByKind);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-muted-foreground">
        {new Date(data.from).toLocaleDateString()} –{" "}
        {new Date(data.to).toLocaleDateString()}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          prominent
          label="Avg cost / paid conversation"
          value={formatUsd(data.avgCostMicroUsdPerPaidEpisode)}
          hint="COGS per conversation that led to a paid order"
        />
        <Stat
          label="Avg cost / conversation"
          value={formatUsd(data.avgCostMicroUsdPerEpisode)}
        />
        <Stat
          label="Conversations per paid order"
          value={data.episodesPerPaidOrder.toFixed(2)}
        />
        <Stat
          label="Total conversations"
          value={data.episodeCount.toLocaleString()}
        />
        <Stat
          label="Paid"
          value={data.paidEpisodeCount.toLocaleString()}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost by kind</CardTitle>
          </CardHeader>
          <CardContent>
            {kinds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data.</p>
            ) : (
              <dl className="flex flex-col gap-2">
                {kinds.map(([kind, cost]) => (
                  <div
                    key={kind}
                    className="flex items-center justify-between border-b border-foreground/5 pb-2 last:border-0 last:pb-0"
                  >
                    <dt className="text-sm text-muted-foreground">{kind}</dt>
                    <dd className="font-mono text-sm tabular-nums">
                      {formatUsd(cost)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Per business</CardTitle>
          </CardHeader>
          <CardContent>
            {data.perBusiness.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead className="text-right">Conversations</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.perBusiness.map((b) => (
                    <TableRow key={b.businessId}>
                      <TableCell className="font-mono text-xs">
                        {b.businessId}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {b.episodes.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatUsd(b.costMicroUsd)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {data.note ? (
        <p className="text-xs text-muted-foreground">{data.note}</p>
      ) : null}
    </div>
  );
}
