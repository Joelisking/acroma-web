/**
 * Public surface of the Acroma API client.
 *
 * Server-only modules are not re-exported here to avoid accidental
 * client-side imports. Import them directly:
 *   - `@/lib/api/server`   → apiFetch (Server Components / Actions / Routes)
 *   - `@/lib/api/auth`     → login / register / logout Server Actions
 *   - `@/lib/api/cookies`  → cookie helpers
 *
 * Client-safe re-exports below.
 */

export type {
  Business,
  AuthResponse,
  RefreshResponse,
  ApiErrorBody,
} from "./types";

export { getSocket, disconnectSocket } from "./socket";
