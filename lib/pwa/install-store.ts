/**
 * Single source of truth for the `beforeinstallprompt` event.
 *
 * The event fires once and can only be `prompt()`-ed once, so multiple
 * components must NOT each listen — they share this module-level store and
 * read it via `useInstallPrompt`.
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    emit();
  });
}

export function subscribeInstall(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** Snapshot: whether a one-tap install is currently available. */
export function getCanInstall(): boolean {
  return deferred !== null;
}

export function getInstalled(): boolean {
  return installed;
}

/** Returns true if the user accepted. No-op (false) if nothing was captured. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const event = deferred;
  deferred = null; // consume — the event can only be prompted once
  emit();
  await event.prompt();
  const choice = await event.userChoice;
  return choice.outcome === "accepted";
}
