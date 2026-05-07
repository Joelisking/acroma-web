"use client";

import * as React from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  checkSupport,
  getCurrentSubscription,
  subscribe,
  unsubscribe,
  serializeSubscription,
} from "@/lib/web-push-client";
import {
  saveWebPushSubscriptionAction,
  clearWebPushSubscriptionAction,
} from "@/lib/api/web-push";
import { cn } from "@/lib/utils";

type NotificationsCardProps = {
  vapidPublicKey: string | null;
};

type State =
  | { kind: "loading" }
  | { kind: "unsupported"; reason: string }
  | { kind: "no-server-key" }
  | { kind: "denied" }
  | { kind: "off" }
  | { kind: "on" };

export function NotificationsCard({ vapidPublicKey }: NotificationsCardProps) {
  const [state, setState] = React.useState<State>({ kind: "loading" });
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    void resolve();
    async function resolve() {
      const support = checkSupport();
      if (support !== "supported") {
        setState({
          kind: "unsupported",
          reason:
            support === "no-sw"
              ? "Service Workers aren't available here"
              : support === "no-push"
                ? "Push isn't available here"
                : "Notifications aren't available here",
        });
        return;
      }
      if (!vapidPublicKey) {
        setState({ kind: "no-server-key" });
        return;
      }
      if (Notification.permission === "denied") {
        setState({ kind: "denied" });
        return;
      }
      const sub = await getCurrentSubscription();
      setState({ kind: sub ? "on" : "off" });
    }
  }, [vapidPublicKey]);

  async function turnOn() {
    if (!vapidPublicKey) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        if (permission === "denied") setState({ kind: "denied" });
        toast.error("Notifications were not allowed");
        return;
      }
      const sub = await subscribe(vapidPublicKey);
      const payload = serializeSubscription(sub);
      const result = await saveWebPushSubscriptionAction(payload);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setState({ kind: "on" });
      toast.success("Notifications on");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't enable notifications",
      );
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    try {
      await unsubscribe();
      const result = await clearWebPushSubscriptionAction();
      if (!result.ok) toast.error(result.error);
      setState({ kind: "off" });
      toast.success("Notifications off");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't disable notifications",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4",
        state.kind === "on"
          ? "border-brand-green/25 bg-brand-green-soft"
          : "border-border/70 bg-muted/40",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          state.kind === "on"
            ? "bg-brand-green/15 text-brand-green"
            : "bg-background text-muted-foreground",
        )}
      >
        {state.kind === "on" ? (
          <Bell className="size-5" strokeWidth={1.75} />
        ) : (
          <BellOff className="size-5" strokeWidth={1.75} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            state.kind === "on" ? "text-brand-green" : "text-foreground",
          )}
        >
          <Heading state={state} />
        </p>
        <p
          className={cn(
            "text-xs",
            state.kind === "on"
              ? "text-brand-navy/70"
              : "text-muted-foreground",
          )}
        >
          <Subline state={state} />
        </p>
      </div>
      <Trigger
        state={state}
        busy={busy}
        onTurnOn={turnOn}
        onTurnOff={turnOff}
      />
    </div>
  );
}

function Heading({ state }: { state: State }) {
  switch (state.kind) {
    case "loading":
      return <>Checking…</>;
    case "unsupported":
      return <>Not available in this browser</>;
    case "no-server-key":
      return <>Server not configured</>;
    case "denied":
      return <>Permission blocked</>;
    case "off":
      return <>Notifications off</>;
    case "on":
      return <>Notifications on</>;
  }
}

function Subline({ state }: { state: State }) {
  switch (state.kind) {
    case "loading":
      return <>One moment…</>;
    case "unsupported":
      return <>{state.reason}.</>;
    case "no-server-key":
      return <>Web Push isn&apos;t set up on the backend yet.</>;
    case "denied":
      return (
        <>
          Re-enable in your browser&apos;s site settings, then refresh.
        </>
      );
    case "off":
      return <>Get pinged on this device when something needs you.</>;
    case "on":
      return <>This browser will be alerted for new orders and chats.</>;
  }
}

function Trigger({
  state,
  busy,
  onTurnOn,
  onTurnOff,
}: {
  state: State;
  busy: boolean;
  onTurnOn: () => void;
  onTurnOff: () => void;
}) {
  if (state.kind === "loading") {
    return <Loader2 className="text-muted-foreground size-4 animate-spin" />;
  }
  if (
    state.kind === "unsupported" ||
    state.kind === "denied" ||
    state.kind === "no-server-key"
  ) {
    return null;
  }
  if (state.kind === "off") {
    return (
      <Button onClick={onTurnOn} disabled={busy} size="sm">
        {busy ? <Loader2 className="animate-spin" /> : null}
        Turn on
      </Button>
    );
  }
  return (
    <Button
      onClick={onTurnOff}
      variant="outline"
      disabled={busy}
      size="sm"
    >
      {busy ? <Loader2 className="animate-spin" /> : null}
      Turn off
    </Button>
  );
}
