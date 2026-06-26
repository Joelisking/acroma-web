"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createDiscountAction,
  updateDiscountAction,
  type DiscountInput,
} from "@/lib/api/discounts-actions";
import type { Discount, DiscountType } from "@/lib/api/types";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  existing?: Discount;
};

export function DiscountForm({ mode, existing }: Props) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const usageLocked = (existing?.usageCount ?? 0) > 0;

  const [code, setCode] = React.useState(existing?.code ?? "");
  const [type, setType] = React.useState<DiscountType>(existing?.type ?? "PERCENTAGE");
  const [value, setValue] = React.useState(String(existing?.value ?? ""));
  const [validFrom, setValidFrom] = React.useState(
    existing?.validFrom ? existing.validFrom.slice(0, 16) : "",
  );
  const [validUntil, setValidUntil] = React.useState(
    existing?.validUntil ? existing.validUntil.slice(0, 16) : "",
  );
  const [totalUsageLimit, setTotalUsageLimit] = React.useState(
    existing?.totalUsageLimit != null ? String(existing.totalUsageLimit) : "",
  );
  const [perCustomerLimit, setPerCustomerLimit] = React.useState(
    String(existing?.perCustomerLimit ?? 1),
  );
  const [isActive, setIsActive] = React.useState(existing?.isActive ?? true);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 1) {
      toast.error("Value must be a positive number");
      return;
    }
    const payload: DiscountInput = {
      code: code.trim().toUpperCase(),
      type,
      value: numericValue,
      validFrom: validFrom ? new Date(validFrom).toISOString() : null,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      totalUsageLimit: totalUsageLimit ? Number(totalUsageLimit) : null,
      perCustomerLimit: perCustomerLimit ? Number(perCustomerLimit) : null,
    };

    startTransition(async () => {
      if (mode === "create") {
        const result = await createDiscountAction(payload);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Discount created");
        router.push("/dashboard/discounts");
      } else if (existing) {
        const result = await updateDiscountAction(existing.id, {
          ...(usageLocked
            ? {}
            : { code: payload.code, type: payload.type, value: payload.value }),
          validFrom: payload.validFrom ?? undefined,
          validUntil: payload.validUntil ?? undefined,
          totalUsageLimit: payload.totalUsageLimit,
          perCustomerLimit: payload.perCustomerLimit ?? undefined,
          isActive,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Discount updated");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="SAVE20"
          maxLength={40}
          disabled={pending || usageLocked}
          required
        />
        {usageLocked ? (
          <p className="text-muted-foreground text-xs">
            Code is locked after the first redemption.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as DiscountType)}
            disabled={pending || usageLocked}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">% off</SelectItem>
              <SelectItem value="FIXED">Fixed amount off</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">
            {type === "PERCENTAGE" ? "Percent (1-100)" : "Amount"}
          </Label>
          <Input
            id="value"
            type="number"
            inputMode="decimal"
            min={1}
            max={type === "PERCENTAGE" ? 100 : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={pending || usageLocked}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="validFrom">Valid from</Label>
          <DateTimePicker
            id="validFrom"
            value={validFrom}
            onChange={setValidFrom}
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid until</Label>
          <DateTimePicker
            id="validUntil"
            value={validUntil}
            onChange={setValidUntil}
            disabled={pending}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="totalUsageLimit">Total uses (optional)</Label>
          <Input
            id="totalUsageLimit"
            type="number"
            min={1}
            value={totalUsageLimit}
            onChange={(e) => setTotalUsageLimit(e.target.value)}
            disabled={pending}
            placeholder="Unlimited"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="perCustomerLimit">Uses per customer</Label>
          <Input
            id="perCustomerLimit"
            type="number"
            min={1}
            value={perCustomerLimit}
            onChange={(e) => setPerCustomerLimit(e.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      {mode === "edit" ? (
        <div className="card-warm flex items-center justify-between gap-4 p-3">
          <div className="space-y-1">
            <Label htmlFor="isActive" className="text-sm font-medium">
              Active
            </Label>
            <p className="text-muted-foreground text-xs">
              Inactive codes can&apos;t be redeemed by customers.
            </p>
          </div>
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={pending}
          />
        </div>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {mode === "create" ? "Create" : "Save"}
        </Button>
      </div>
    </form>
  );
}
