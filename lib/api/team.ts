import "server-only";

import { apiFetch, ApiError } from "./server";
import type { InvitePreview, TeamResponse } from "./types";

/** Owner-level. The backend scopes everything to the calling business. */
export async function getTeam(): Promise<TeamResponse> {
  return apiFetch<TeamResponse>("/team");
}

/**
 * What an invite link points at, or why it no longer works. Public: the join
 * page calls this before the visitor has any account at all.
 */
export type InviteLookup =
  | { state: "ok"; preview: InvitePreview }
  | { state: "unknown" }
  | { state: "dead"; reason: string };

export async function lookupInvite(token: string): Promise<InviteLookup> {
  if (!token) return { state: "unknown" };
  try {
    const preview = await apiFetch<InvitePreview>(
      `/team/invites/preview?token=${encodeURIComponent(token)}`,
      { auth: false },
    );
    return { state: "ok", preview };
  } catch (err) {
    if (err instanceof ApiError && err.status === 410) {
      return { state: "dead", reason: err.message || "This link no longer works" };
    }
    return { state: "unknown" };
  }
}
