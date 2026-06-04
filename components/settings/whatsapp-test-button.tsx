"use client";

import * as React from "react";
import { Send, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { testWhatsappAction } from "@/lib/api/settings-actions";

type Props = { disabled?: boolean };

export function WhatsappTestButton({ disabled }: Props) {
  const [open, setOpen] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await testWhatsappAction(phone);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Test message sent. Check WhatsApp on ${phone}.`);
      setOpen(false);
      setPhone("");
    });
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="gap-2"
      >
        <Send />
        Send test message
      </Button>
    );
  }

  return (
    <form
      onSubmit={send}
      className="flex w-full flex-col gap-2 sm:max-w-md sm:items-end"
    >
      <div className="w-full space-y-1.5">
        <Label htmlFor="whatsapp-test-phone" className="text-xs">
          Send to
        </Label>
        <Input
          id="whatsapp-test-phone"
          ref={inputRef}
          inputMode="tel"
          autoComplete="off"
          placeholder="233244000000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-10 font-mono text-xs"
        />
        <p className="text-muted-foreground text-xs leading-relaxed">
          A WhatsApp-active number with country code, digits only, no{" "}
          <code className="font-mono">+</code> or spaces. We&apos;ll send a
          single test message there.
        </p>
      </div>
      <div className="flex w-full justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setPhone("");
          }}
          disabled={pending}
          className="gap-1.5"
        >
          <X className="size-4" />
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending} className="gap-1.5">
          {pending ? <Loader2 className="animate-spin" /> : <Send />}
          Send
        </Button>
      </div>
    </form>
  );
}
