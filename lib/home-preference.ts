/**
 * Which surface the dashboard opens on. Stored in a cookie so a cold app/PWA
 * launch and post-login entry can honour it without a backend field. The
 * `/dashboard` index reads it and redirects to Orders when set, while an
 * in-app click on the Today tab (which carries a dashboard referer) still
 * shows Today. Kept free of `next/headers` so client components can import the
 * type and cookie name safely.
 */
export const HOME_COOKIE = "acroma_home";

export type HomeSurface = "today" | "orders";
