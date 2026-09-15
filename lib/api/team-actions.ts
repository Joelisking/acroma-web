"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import { setAuthCookies } from "./cookies";
import type { AdminLoginResponse, CreatedInvite } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const TEAM_PATH = "/dashboard/settings/team";

/**
 * Mints an invite link. The URL in the reply carries the raw token, which the
 * backend never stores and never returns again, so the dialog has to show it
 * straight away.
 */
export async function createInviteAction(): Promise<
  ActionResult<CreatedInvite>
> {
  try {
    const data = await apiFetch<CreatedInvite>("/team/invites", {
      method: "POST",
    });
    revalidatePath(TEAM_PATH);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't create invite link") };
  }
}

export async function revokeInviteAction(id: string): Promise<ActionResult> {
  try {
    await apiFetch<{ ok: true }>(`/team/invites/${id}`, { method: "DELETE" });
    revalidatePath(TEAM_PATH);
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't cancel invite") };
  }
}

export async function removeMemberAction(id: string): Promise<ActionResult> {
  try {
    await apiFetch<{ ok: true }>(`/team/members/${id}`, { method: "DELETE" });
    revalidatePath(TEAM_PATH);
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't remove this person") };
  }
}

/**
 * The join page's submit. Registers the invitee and signs them straight in,
 * replacing whatever session this browser had — the person who opened the
 * link is the person who now owns these cookies.
 */
export async function acceptInviteAction(input: {
  token: string;
  name: string;
  email: string;
  password: string;
}): Promise<ActionResult<{ businessName: string }>> {
  try {
    const data = await apiFetch<AdminLoginResponse>("/team/invites/accept", {
      method: "POST",
      body: input,
      auth: false,
    });
    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: "ADMIN",
      mustChangePassword: false,
      email: data.user.email,
    });
    return { ok: true, data: { businessName: data.business.name } };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't join this business") };
  }
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
