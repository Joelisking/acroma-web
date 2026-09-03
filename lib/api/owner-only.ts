import "server-only";

import { redirect } from "next/navigation";

import { readRole } from "./cookies";

/** Where a worker belongs: the screen they ring up customers on. */
export const STAFF_HOME = "/dashboard/till";

/**
 * Send a worker who landed on an owner screen back to the till.
 *
 * This is a convenience, not a boundary: the API answers 403 on every one of
 * these routes whatever the browser does. It exists so a stale link, a
 * bookmark, or a shared URL puts a worker on the screen they actually use
 * instead of an error page.
 */
export async function redirectStaffHome(): Promise<void> {
  if ((await readRole()) === "STAFF") redirect(STAFF_HOME);
}
