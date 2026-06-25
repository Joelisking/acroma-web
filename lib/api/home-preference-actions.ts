"use server";

import { cookies } from "next/headers";
import { HOME_COOKIE, type HomeSurface } from "@/lib/home-preference";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Persist which surface the dashboard opens on. Not a secret, so a plain
 * long-lived cookie is fine; the index route reads it to route a cold launch
 * to the merchant's preferred home.
 */
export async function setHomePreferenceAction(
  surface: HomeSurface,
): Promise<{ ok: true }> {
  const store = await cookies();
  store.set(HOME_COOKIE, surface, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
  return { ok: true };
}
