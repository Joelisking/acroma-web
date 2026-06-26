"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createBroadcastAction,
  enqueueBroadcastAction,
  previewRecipientCountAction,
} from "@/lib/api/broadcasts-actions";
import { syncTemplatesAction } from "@/lib/api/templates-actions";
import type {
  BroadcastAudienceBucket,
  Discount,
  WhatsappTemplate,
} from "@/lib/api/types";

const BUCKET_LABELS: Record<BroadcastAudienceBucket, string> = {
  IN_24H_WINDOW: "Customers active in the last 24 hours (free-text OK)",
  ACTIVE_LAST_30_DAYS: "Customers active in the last 30 days (template required)",
  ACTIVE_LAST_90_DAYS: "Customers active in the last 90 days (template required)",
  ALL_CUSTOMERS: "All customers who've ordered (template required)",
};

const BUCKETS_NEEDING_TEMPLATE = new Set([
  "ALL_CUSTOMERS",
  "ACTIVE_LAST_30_DAYS",
  "ACTIVE_LAST_90_DAYS",
]);

type Props = {
  templates: WhatsappTemplate[];
  discounts: Discount[];
};

function renderPreview(body: string, code: string | null): string {
  return body
    .replaceAll("{name}", "there")
    .replaceAll("{code}", code ?? "");
}

export function BroadcastComposer({ templates, discounts }: Props) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [syncing, startSync] = React.useTransition();

  const [name, setName] = React.useState("");
  const [bucket, setBucket] = React.useState<BroadcastAudienceBucket>(
    "IN_24H_WINDOW",
  );
  const [bodyTemplate, setBodyTemplate] = React.useState("");
  const [templateId, setTemplateId] = React.useState<string>("none");
  const [discountId, setDiscountId] = React.useState<string>("none");
  const [recipientCount, setRecipientCount] = React.useState<number | null>(null);

  const selectedTemplate = templates.find((t) => t.id === templateId);
  const selectedDiscount = discounts.find((d) => d.id === discountId);

  React.useEffect(() => {
    let cancelled = false;
    previewRecipientCountAction(bucket)
      .then((res) => {
        if (!cancelled) setRecipientCount(res.ok ? res.data.count : null);
      })
      .catch(() => {
        if (!cancelled) setRecipientCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [bucket]);

  const needsTemplate = BUCKETS_NEEDING_TEMPLATE.has(bucket);
  const templateMismatch =
    selectedTemplate && selectedTemplate.variableCount !== 2;

  function insertAtCursor(token: string) {
    setBodyTemplate((prev) => prev + token);
  }

  function onSync() {
    startSync(async () => {
      const result = await syncTemplatesAction();
      if (!result.ok) toast.error(result.error);
      else toast.success("Templates synced");
      router.refresh();
    });
  }

  function onSave(sendImmediately: boolean) {
    if (needsTemplate && templateId === "none") {
      toast.error("This audience requires an approved WhatsApp template.");
      return;
    }
    startTransition(async () => {
      const created = await createBroadcastAction({
        name,
        audienceBucket: bucket,
        bodyTemplate,
        templateId: templateId === "none" ? null : templateId,
        templateLanguage: selectedTemplate?.language ?? null,
        discountId: discountId === "none" ? null : discountId,
      });
      if (!created.ok) {
        toast.error(created.error);
        return;
      }
      if (sendImmediately) {
        const sent = await enqueueBroadcastAction(created.data.id);
        if (!sent.ok) {
          toast.error(sent.error);
          return;
        }
        toast.success("Broadcast queued for sending");
      } else {
        toast.success("Draft saved");
      }
      router.push(`/dashboard/broadcasts/${created.data.id}`);
    });
  }

  const previewBody = renderPreview(bodyTemplate, selectedDiscount?.code ?? null);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Friday promo"
          maxLength={80}
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bucket">Audience</Label>
        <Select
          value={bucket}
          onValueChange={(v) => setBucket(v as BroadcastAudienceBucket)}
          disabled={pending}
        >
          <SelectTrigger id="bucket">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(BUCKET_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs">
          Sends to {recipientCount ?? "…"} customer{recipientCount === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="template">WhatsApp template{needsTemplate ? "" : " (optional)"}</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={syncing}
            onClick={onSync}
          >
            Refresh
          </Button>
        </div>
        <Select
          value={templateId}
          onValueChange={setTemplateId}
          disabled={pending}
        >
          <SelectTrigger id="template">
            <SelectValue placeholder="No template (in-window only)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No template (in-window only)</SelectItem>
            {templates
              .filter((t) => t.status === "APPROVED")
              .map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} ({t.language})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {templateMismatch ? (
          <p className="text-destructive text-xs">
            This template has {selectedTemplate?.variableCount} body parameters. v1 only supports templates with exactly 2 parameters (name, then code). Pick a different template or update the template in Meta Business Manager.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="discount">Discount code (optional)</Label>
        <Select value={discountId} onValueChange={setDiscountId} disabled={pending}>
          <SelectTrigger id="discount">
            <SelectValue placeholder="No discount" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No discount</SelectItem>
            {discounts.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="body">Message</Label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("{name}")}>
              + name
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("{code}")}>
              + code
            </Button>
          </div>
        </div>
        <Textarea
          id="body"
          value={bodyTemplate}
          onChange={(e) => setBodyTemplate(e.target.value)}
          rows={5}
          maxLength={1024}
          placeholder="Hi {name}, use {code} for 20% off this weekend!"
          disabled={pending}
        />
      </div>

      <div className="card-warm bg-muted/30 p-4">
        <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
          Preview
        </p>
        <p className="text-foreground mt-2 text-sm whitespace-pre-wrap">
          {previewBody || "(empty)"}
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onSave(false)}
          disabled={pending || !name || !bodyTemplate}
        >
          Save draft
        </Button>
        <Button
          type="button"
          onClick={() => onSave(true)}
          disabled={pending || !name || !bodyTemplate || Boolean(templateMismatch)}
        >
          Save &amp; send
        </Button>
      </div>
    </div>
  );
}
