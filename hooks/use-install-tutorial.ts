"use client";

import * as React from "react";
import { useWebPush } from "./use-web-push";
import { useInstallPrompt } from "./use-install-prompt";
import { useClientValue } from "./use-client-value";
import {
  getInstallPlatform,
  isStandalone,
  type InstallPlatform,
} from "@/lib/pwa/detect";

const SNOOZE_KEY = "acroma:install-tutorial";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

export type TutorialStep = "install" | "enable" | "ios-steps" | "manual-steps";

type TutorialRecord = { snoozedUntil?: number; completed?: boolean };

function readRecord(): TutorialRecord {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SNOOZE_KEY) ?? "{}") as TutorialRecord;
  } catch {
    return {};
  }
}

function writeRecord(record: TutorialRecord): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(SNOOZE_KEY, JSON.stringify(record));
  } catch {
    // private mode — ignore
  }
}

/** Pure: which step to show, or null when there's nothing to nudge. */
export function pickStep(args: {
  installed: boolean;
  notificationsOn: boolean;
  canInstall: boolean;
  platform: InstallPlatform;
}): TutorialStep | null {
  const { installed, notificationsOn, canInstall, platform } = args;
  if (installed) return notificationsOn ? null : "enable";
  if (canInstall) return "install";
  return platform === "ios" ? "ios-steps" : "manual-steps";
}

export type InstallTutorial = {
  open: boolean;
  step: TutorialStep;
  platform: InstallPlatform;
  canInstall: boolean;
  busy: boolean;
  install: () => Promise<void>;
  enable: () => Promise<{ ok: boolean; error?: string }>;
  snooze: () => void;
  dismiss: () => void;
};

export function useInstallTutorial(): InstallTutorial {
  const { permission, subscribed, busy, enable } = useWebPush();
  const { canInstall, promptInstall } = useInstallPrompt();
  const installed = useClientValue(isStandalone, false);
  const platform = useClientValue<InstallPlatform>(getInstallPlatform, "other");

  const notificationsOn = subscribed && permission === "granted";
  const step = pickStep({ installed, notificationsOn, canInstall, platform });

  const [dismissed, setDismissed] = React.useState(false);
  // Suppress (and avoid any flash before hydration) when snoozed or completed.
  const suppressed = useClientValue(() => {
    const record = readRecord();
    return Boolean(record.completed) || (record.snoozedUntil ?? 0) > Date.now();
  }, true);

  // Remember completion so it never auto-opens again.
  React.useEffect(() => {
    if (installed && notificationsOn) writeRecord({ completed: true });
  }, [installed, notificationsOn]);

  const open = step !== null && !dismissed && !suppressed;

  const snooze = React.useCallback(() => {
    writeRecord({ snoozedUntil: Date.now() + SNOOZE_MS });
    setDismissed(true);
  }, []);

  const dismiss = React.useCallback(() => setDismissed(true), []);

  const install = React.useCallback(async () => {
    await promptInstall();
  }, [promptInstall]);

  return {
    open,
    step: step ?? "enable",
    platform,
    canInstall,
    busy,
    install,
    enable,
    snooze,
    dismiss,
  };
}
