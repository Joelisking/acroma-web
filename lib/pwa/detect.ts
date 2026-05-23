export type InstallPlatform = "ios" | "android-chromium" | "other";

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

/** Chromium on Android/desktop fires beforeinstallprompt; iOS never does. */
export function getInstallPlatform(): InstallPlatform {
  if (isIos()) return "ios";
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const chromium = /Chrome|Chromium|Edg|SamsungBrowser|CriOS/.test(ua);
  if (isAndroid() && chromium) return "android-chromium";
  return "other";
}
