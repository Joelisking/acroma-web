import { NextResponse } from "next/server";

import { isAdminAuthed } from "@/lib/admin/auth";

/**
 * Server-side proxy to the backend's internal `GET /admin/usage` report. The
 * `x-admin-token` secret stays here and never reaches the browser. Gated by the
 * separate admin session cookie (not merchant auth).
 */
export async function GET(request: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiUrl = process.env.ACROMA_API_URL;
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!apiUrl || !adminToken) {
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const qs = new URLSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);

  const upstream = await fetch(`${apiUrl}/admin/usage?${qs.toString()}`, {
    headers: { "x-admin-token": adminToken },
    cache: "no-store",
  });

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch {
    payload = { error: "bad upstream response" };
  }

  return NextResponse.json(payload, { status: upstream.status });
}
