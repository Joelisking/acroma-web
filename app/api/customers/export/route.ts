import { readAccessToken } from "@/lib/api/cookies";
import { tryRefresh } from "@/lib/api/server";

const API_URL = process.env.ACROMA_API_URL;

/**
 * Streams a CSV export of the merchant's customers to the browser.
 *
 * The backend `GET /customers/export` is JWT-guarded, but the access token
 * lives in an HTTP-only cookie that the browser can't attach to a plain
 * anchor download. So we proxy through this same-origin Route Handler: we
 * read the access token server-side (refreshing it on a 401, exactly like the
 * socket-token route), then re-emit the CSV with download headers.
 *
 * The body is CSV not JSON, so we can't use `apiFetch` here — it assumes a
 * JSON response.
 */
async function fetchCsv(token: string): Promise<Response> {
  return fetch(`${API_URL}/customers/export`, {
    headers: { Accept: "text/csv", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export async function GET() {
  if (!API_URL) {
    return new Response("Server misconfigured", { status: 500 });
  }

  let token = await readAccessToken();
  if (!token) token = await tryRefresh();
  if (!token) {
    return new Response("unauthenticated", { status: 401 });
  }

  let upstream = await fetchCsv(token);
  if (upstream.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) upstream = await fetchCsv(refreshed);
  }

  if (!upstream.ok) {
    return new Response("Couldn't export customers", {
      status: upstream.status,
    });
  }

  const csv = await upstream.text();
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="customers.csv"',
      "Cache-Control": "no-store",
    },
  });
}
