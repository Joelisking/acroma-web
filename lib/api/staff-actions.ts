"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "./server";
import type { CreatedStaff, StaffTemporaryPassword } from "./types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const WORKERS_PATH = "/dashboard/settings/workers";

export type StaffInput = {
  name: string;
  username: string;
};

/**
 * Creates a worker login. The temporary password in the reply is the only
 * time that value exists outside the backend's hash — show it to the owner
 * straight away.
 */
export async function createStaffAction(
  input: StaffInput,
): Promise<ActionResult<CreatedStaff>> {
  try {
    const data = await apiFetch<CreatedStaff>("/staff", {
      method: "POST",
      body: { name: input.name.trim(), username: input.username.trim() },
    });
    revalidatePath(WORKERS_PATH);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't add worker") };
  }
}

export async function resetStaffPasswordAction(
  id: string,
): Promise<ActionResult<StaffTemporaryPassword>> {
  try {
    const data = await apiFetch<StaffTemporaryPassword>(
      `/staff/${id}/reset-password`,
      { method: "POST" },
    );
    revalidatePath(WORKERS_PATH);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't reset password") };
  }
}

export async function deactivateStaffAction(
  id: string,
): Promise<ActionResult> {
  try {
    await apiFetch<{ ok: true }>(`/staff/${id}/deactivate`, {
      method: "PATCH",
    });
    revalidatePath(WORKERS_PATH);
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't deactivate worker") };
  }
}

export async function reactivateStaffAction(
  id: string,
): Promise<ActionResult> {
  try {
    await apiFetch<{ ok: true }>(`/staff/${id}/reactivate`, {
      method: "PATCH",
    });
    revalidatePath(WORKERS_PATH);
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't restore worker") };
  }
}

/**
 * A worker changing their own password — the route out of the forced first
 * login change. Staff-only; an owner uses `changePasswordAction` in `auth.ts`.
 * The backend deliberately keeps this session alive, so there are no new
 * tokens to store here.
 */
export async function changeOwnPasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  try {
    await apiFetch<{ ok: true }>("/staff/me/password", {
      method: "POST",
      body: input,
    });
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: humanError(err, "Couldn't update password") };
  }
}

function humanError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
