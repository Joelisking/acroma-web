"use client";

import { useSyncExternalStore } from "react";
import {
  getCanInstall,
  promptInstall,
  subscribeInstall,
} from "@/lib/pwa/install-store";

/**
 * React binding to the shared install store. `canInstall` becomes true once
 * the browser has offered a one-tap install (Chromium Android/desktop).
 */
export function useInstallPrompt(): {
  canInstall: boolean;
  promptInstall: () => Promise<boolean>;
} {
  const canInstall = useSyncExternalStore(
    subscribeInstall,
    getCanInstall,
    () => false,
  );
  return { canInstall, promptInstall };
}
