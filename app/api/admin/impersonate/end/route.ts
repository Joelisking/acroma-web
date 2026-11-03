import { NextResponse } from "next/server"

import { endImpersonation } from "@/lib/api/impersonation"

/**
 * The banner's Exit button. Ends the backend session (ignoring one that is
 * already gone), clears every merchant cookie, and returns to the merchant's
 * admin page with a 303.
 */
export async function POST(request: Request) {
  const destination = await endImpersonation()
  return NextResponse.redirect(new URL(destination, request.url), 303)
}
