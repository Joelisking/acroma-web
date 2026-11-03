import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Field = { name: string; label: string; placeholder?: string };

type Props = {
  basePath: string;
  params: Record<string, string | undefined>;
  /** Free-text GET fields. */
  fields?: Field[];
  /** Quick links for a `range` param (24h, 7d, 30d). */
  ranges?: boolean;
  /** Include the "All time" range chip (default true). */
  allTime?: boolean;
  /** Quick links for a `level` param. */
  levels?: boolean;
};

const RANGES = [
  { value: undefined, label: "All time" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];
const LEVELS = [
  { value: undefined, label: "All levels" },
  { value: "error", label: "Error" },
  { value: "warn", label: "Warn" },
];

function hrefWith(basePath: string, params: Props["params"], key: string, value?: string) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...params, cursor: undefined, [key]: value })) {
    if (v) qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}

function Chips(props: {
  basePath: string;
  params: Props["params"];
  name: string;
  options: { value: string | undefined; label: string }[];
}) {
  return (
    <div className="flex gap-1">
      {props.options.map((o) => {
        const active = (props.params[props.name] ?? undefined) === o.value;
        return (
          <Link
            key={o.label}
            href={hrefWith(props.basePath, props.params, props.name, o.value)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs transition-colors",
              active ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}

export function FilterBar({ basePath, params, fields = [], ranges, levels, allTime = true }: Props) {
  const carried = Object.entries(params).filter(
    ([k, v]) => v && k !== "cursor" && !fields.some((f) => f.name === k),
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      {fields.length > 0 ? (
        <form method="get" action={basePath} className="flex flex-wrap items-end gap-2">
          {carried.map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          {fields.map((f) => (
            <label key={f.name} className="flex flex-col gap-1 text-xs text-muted-foreground">
              {f.label}
              <Input
                name={f.name}
                defaultValue={params[f.name] ?? ""}
                placeholder={f.placeholder}
                className="h-8 w-56"
              />
            </label>
          ))}
          <Button type="submit" size="sm" variant="outline">
            Filter
          </Button>
        </form>
      ) : null}
      {levels ? <Chips basePath={basePath} params={params} name="level" options={LEVELS} /> : null}
      {ranges ? <Chips basePath={basePath} params={params} name="range" options={allTime ? RANGES : RANGES.slice(1)} /> : null}
    </div>
  );
}
