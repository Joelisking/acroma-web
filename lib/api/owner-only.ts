import "server-only";

import { redirect } from "next/navigation";

import { readRole } from "./cookies";

/**
 * Send a worker who landed on an owner screen back to their orders.
 *
 * This is a convenience, not a boundary: the API answers 403 on every one of
 * these routes whatever the browser does. It exists so a stale link, a
 * bookmark, or a shared URL puts a worker on the screen they actually use
 * instead of an error page.
 */
export async function redirectStaffToOrders(): Promise<void> {
  if ((await readRole()) === "STAFF") redirect("/dashboard/orders");
}
