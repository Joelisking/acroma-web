"use server";

import { clearMustChangePassword } from "@/lib/api/cookies";
import { changeOwnPasswordAction } from "@/lib/api/staff-actions";

/**
 * The forced first password change, end to end. The backend swaps the hash
 * and drops the flag on the row; this drops the matching cookie so the
 * dashboard layout stops sending the worker back here.
 *
 * The clear only runs on success, so a failed attempt leaves the worker on
 * the screen they still owe us.
 */
export async function completeFirstPasswordChangeAction(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const result = await changeOwnPasswordAction(input);
  if (result.ok) {
    await clearMustChangePassword();
  }
  return result;
}
