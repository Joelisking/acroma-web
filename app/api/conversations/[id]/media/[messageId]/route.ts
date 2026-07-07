import { readAccessToken } from "@/lib/api/cookies";
import { tryRefresh } from "@/lib/api/server";

const API_URL = process.env.ACROMA_API_URL;

/**
 * Streams a customer-sent media file (an image) for the dashboard to render.
 *
 * The backend media endpoint is JWT-guarded, but the access token lives in an
 * HTTP-only cookie the browser can't attach to an `<img>` request. So we proxy
 * through this same-origin Route Handler: read the token server-side (refresh
 * on 401, like the customers-export route), fetch the bytes from the backend,
 * and re-emit them with the upstream content type. The body is binary, so we
 * can't use `apiFetch` (it assumes JSON).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  if (!API_URL) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const { id, messageId } = await params;
  const path = `/conversations/${encodeURIComponent(id)}/messages/${encodeURIComponent(messageId)}/media`;

  const fetchMedia = (token: string) =>
    fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

  let token = await readAccessToken();
  if (!token) token = await tryRefresh();
  if (!token) return new Response("unauthenticated", { status: 401 });

  let upstream = await fetchMedia(token);
  if (upstream.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) upstream = await fetchMedia(refreshed);
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Media unavailable", { status: upstream.status || 404 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/octet-stream",
      // Private per-user media; cache briefly in the browser only.
      "Cache-Control": "private, max-age=300",
    },
  });
}
