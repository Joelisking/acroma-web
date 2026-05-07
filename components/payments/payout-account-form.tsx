"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  resolveAccountAction,
  savePayoutAccountAction,
} from "@/lib/api/payments-actions";
import type { BankSummary } from "@/lib/api/types";

type Stage = "type" | "details" | "confirm";

const detailsSchema = z.object({
  bankCode: z.string().min(1, "Pick a provider"),
  accountNumber: z
    .string()
    .min(8, "At least 8 digits")
    .regex(/^\d+$/, "Digits only"),
});

type DetailsValues = z.infer<typeof detailsSchema>;

export function PayoutAccountForm({
  onSaved,
  onCancel,
  banksBank,
  banksMomo,
}: {
  onSaved: () => void;
  onCancel?: () => void;
  banksBank: BankSummary[];
  banksMomo: BankSummary[];
}) {
  const [stage, setStage] = React.useState<Stage>("type");
  const [accountType, setAccountType] = React.useState<"BANK" | "MOBILE_MONEY" | null>(null);
  const [resolved, setResolved] = React.useState<{
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null>(null);
  const [verifying, setVerifying] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const banks = accountType === "BANK" ? banksBank : banksMomo;

  const form = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { bankCode: "", accountNumber: "" },
  });

  function pickType(t: "BANK" | "MOBILE_MONEY") {
    setAccountType(t);
    form.reset({ bankCode: "", accountNumber: "" });
    setStage("details");
  }

  async function verify(values: DetailsValues) {
    setVerifying(true);
    const bank = banks.find((b) => b.code === values.bankCode);
    const result = await resolveAccountAction({
      accountNumber: values.accountNumber,
      bankCode: values.bankCode,
    });
    setVerifying(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setResolved({
      bankCode: values.bankCode,
      bankName: bank?.name ?? values.bankCode,
      accountNumber: result.data.accountNumber,
      accountName: result.data.accountName,
    });
    setStage("confirm");
  }

  async function save() {
    if (!resolved || !accountType) return;
    setSaving(true);
    const result = await savePayoutAccountAction({
      accountType,
      bankCode: resolved.bankCode,
      bankName: resolved.bankName,
      accountNumber: resolved.accountNumber,
      accountName: resolved.accountName,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Payout account saved");
    onSaved();
  }

  if (stage === "type") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Where should we send your money? Pick one.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => pickType("MOBILE_MONEY")}
            className="rounded-2xl border p-5 text-left hover:border-primary"
          >
            <div className="font-medium">Mobile money</div>
            <div className="text-xs text-muted-foreground mt-1">
              MTN, Vodafone, AirtelTigo
            </div>
          </button>
          <button
            type="button"
            onClick={() => pickType("BANK")}
            className="rounded-2xl border p-5 text-left hover:border-primary"
          >
            <div className="font-medium">Bank account</div>
            <div className="text-xs text-muted-foreground mt-1">
              Any Ghanaian bank
            </div>
          </button>
        </div>
        {onCancel ? (
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  if (stage === "details") {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(verify)} className="space-y-5">
          <FormField
            control={form.control}
            name="bankCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {accountType === "BANK" ? "Bank" : "Provider"}
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => (
                        <SelectItem key={b.code} value={b.code}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {accountType === "BANK" ? "Account number" : "Phone number"}
                </FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    placeholder={accountType === "BANK" ? "1234567890" : "0241234567"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={() => setStage("type")}>
              Back
            </Button>
            <Button type="submit" disabled={verifying} className="gap-2">
              {verifying ? <Loader2 className="animate-spin" /> : null}
              Verify
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  // stage === "confirm"
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border p-5">
        <div className="text-sm text-muted-foreground">This will pay out to</div>
        <div className="text-2xl font-semibold mt-1">
          {resolved?.accountName}
        </div>
        <div className="text-sm text-muted-foreground mt-3">
          {resolved?.bankName} · {resolved?.accountNumber}
        </div>
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={() => setStage("details")}>
          No, edit
        </Button>
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="animate-spin" /> : null}
          Yes, save
        </Button>
      </div>
    </div>
  );
}
