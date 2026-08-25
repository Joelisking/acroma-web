"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatTokens, formatUsd } from "@/lib/admin/format";

const ChartSkeleton = () => (
  <div className="bg-muted h-[260px] w-full animate-pulse rounded-lg" />
);

const UsageTrendChart = dynamic(
  () => import("./usage-trend-chart").then((m) => m.UsageTrendChart),
  { ssr: false, loading: ChartSkeleton },
);

// The four kinds the backend attributes cost/tokens to, in display order. Kinds
// not present in a given period are omitted.
const KIND_ORDER = ["REPLY", "IMAGE", "TRANSCRIPTION", "ORDER_MESSAGE"];

interface PerBusiness {
  businessId: string;
  businessName: string | null;
  episodes: number;
  costMicroUsd: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costByKind: Record<string, number>;
}

interface UsageDaily {
  date: string;
  costMicroUsd: number;
  totalTokens: number;
}

interface UsageReportData {
  from: string;
  to: string;
  episodeCount: number;
  paidEpisodeCount: number;
  avgCostMicroUsdPerEpisode: number;
  avgCostMicroUsdPerPaidEpisode: number;
  episodesPerPaidOrder: number;
  totalCostMicroUsd: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  costByKind: Record<string, number>;
  tokensByKind: Record<string, number>;
  perBusiness: PerBusiness[];
  daily: UsageDaily[];
  uncostedEventCount: number;
  uncostedTokens: number;
  unpricedModels: string[];
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

/** Merchant label: name when present, else a shortened businessId. */
function merchantLabel(b: PerBusiness): string {
  if (b.businessName && b.businessName.trim().length > 0) {
    return b.businessName;
  }
  return `${b.businessId.slice(0, 8)}…`;
}

/** Ordered kinds present in a cost/token map, KIND_ORDER first then any extras. */
function orderedKinds(map: Record<string, number>): string[] {
  const present = Object.keys(map);
  const known = KIND_ORDER.filter((k) => present.includes(k));
  const extras = present.filter((k) => !KIND_ORDER.includes(k)).sort();
  return [...known, ...extras];
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
  const costKinds = orderedKinds(data.costByKind);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-muted-foreground">
        {new Date(data.from).toLocaleDateString()} –{" "}
        {new Date(data.to).toLocaleDateString()}
      </p>

      {data.uncostedEventCount > 0 ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <span aria-hidden>⚠️</span> Cost under-counted:{" "}
          {data.uncostedEventCount.toLocaleString()} AI call(s) using{" "}
          <span className="font-mono">{data.unpricedModels.join(", ")}</span>{" "}
          have no pricing configured, so {formatTokens(data.uncostedTokens)}{" "}
          tokens are recorded at $0 cost. Add these model(s) to the backend
          pricing table (<span className="font-mono">src/usage/pricing.ts</span>)
          or set the matching{" "}
          <span className="font-mono">PRICE_</span> env vars.
        </div>
      ) : null}

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
        <Stat label="Paid" value={data.paidEpisodeCount.toLocaleString()} />
      </div>

      {/* Overall totals */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat
          label="Total cost"
          value={formatUsd(data.totalCostMicroUsd)}
          hint="All AI usage in this period"
        />
        <Stat
          label="Total tokens"
          value={formatTokens(data.totalTokens)}
          hint={`${formatTokens(data.totalPromptTokens)} in / ${formatTokens(
            data.totalCompletionTokens,
          )} out`}
        />
      </div>

      {/* Daily trend */}
      <Card>
        <CardHeader>
          <CardTitle>Usage over time</CardTitle>
          <CardDescription>
            Cost (left axis) and total tokens (right axis) per day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsageTrendChart daily={data.daily} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cost + tokens by type */}
        <Card>
          <CardHeader>
            <CardTitle>By type</CardTitle>
          </CardHeader>
          <CardContent>
            {costKinds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kind</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costKinds.map((kind) => (
                    <TableRow key={kind}>
                      <TableCell className="text-muted-foreground text-sm">
                        {kind}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatTokens(data.tokensByKind[kind] ?? 0)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatUsd(data.costByKind[kind] ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Per merchant */}
        <Card>
          <CardHeader>
            <CardTitle>Per merchant</CardTitle>
          </CardHeader>
          <CardContent>
            {data.perBusiness.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead className="text-right">Conversations</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.perBusiness.map((b) => (
                    <MerchantRow key={b.businessId} business={b} />
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

function MerchantRow({ business }: { business: PerBusiness }) {
  const [open, setOpen] = useState(false);
  const kinds = orderedKinds(business.costByKind);
  const hasBreakdown = kinds.length > 0;

  return (
    <>
      <TableRow>
        <TableCell>
          {hasBreakdown ? (
            <Collapsible open={open} onOpenChange={setOpen}>
              <CollapsibleTrigger className="flex items-center gap-1.5 text-left text-sm hover:underline">
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 transition-transform",
                    open && "rotate-180",
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    !business.businessName && "font-mono text-xs",
                  )}
                  title={business.businessId}
                >
                  {merchantLabel(business)}
                </span>
              </CollapsibleTrigger>
            </Collapsible>
          ) : (
            <span
              className={cn(
                "text-sm",
                !business.businessName && "font-mono text-xs",
              )}
              title={business.businessId}
            >
              {merchantLabel(business)}
            </span>
          )}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {business.episodes.toLocaleString()}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatTokens(business.totalTokens)}
        </TableCell>
        <TableCell className="text-right font-mono tabular-nums">
          {formatUsd(business.costMicroUsd)}
        </TableCell>
      </TableRow>
      {hasBreakdown && open ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={4} className="bg-muted/30 py-2">
            <dl className="flex flex-col gap-1 pl-5">
              {kinds.map((kind) => (
                <div
                  key={kind}
                  className="flex items-center justify-between text-xs"
                >
                  <dt className="text-muted-foreground">{kind}</dt>
                  <dd className="font-mono tabular-nums">
                    {formatUsd(business.costByKind[kind] ?? 0)}
                  </dd>
                </div>
              ))}
            </dl>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
