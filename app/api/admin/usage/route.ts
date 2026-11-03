import { NextResponse } from "next/server";

import { AdminApiError, adminFetch } from "@/lib/admin/api";

/**
 * Server-side proxy to the backend's `GET /super-admin/usage` report. The
 * session token stays in an httpOnly cookie and never reaches browser code.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const payload = await adminFetch<unknown>("/super-admin/usage", {
      searchParams: {
        from: searchParams.get("from"),
        to: searchParams.get("to"),
      },
      onUnauthorized: "throw",
    });
    return NextResponse.json(payload);
  } catch (err) {
    if (err instanceof AdminApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "bad upstream response" }, { status: 502 });
  }
}
