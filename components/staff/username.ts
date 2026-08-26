/**
 * Usernames are unique across every business on Acroma, not just this one, so
 * we suggest a business prefix to make a clash unlikely. The shape the backend
 * accepts is lowercase letters, numbers and hyphens, 3 to 32 characters.
 */
export const USERNAME_PATTERN = /^[a-z0-9-]{3,32}$/

export const USERNAME_HINT =
  "Use 3 to 32 characters: lowercase letters, numbers or hyphens."

const MAX_LENGTH = 32
const MAX_PREFIX = 20

/** Strips a label down to bare lowercase letters and numbers. */
function condense(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

/** The business half of a suggested username, e.g. "mamaskitchen". */
export function usernamePrefix(businessName: string): string {
  return condense(businessName).slice(0, MAX_PREFIX)
}

/**
 * Suggests a username from the business name and the worker's first name,
 * e.g. "mamaskitchen-ama". Returns an empty string when there is nothing to
 * build from, so the field can simply stay untouched.
 */
export function suggestUsername(
  businessName: string,
  workerName: string
): string {
  const prefix = usernamePrefix(businessName)
  const first = condense(workerName.trim().split(/\s+/)[0] ?? "")
  const joined = [prefix, first].filter(Boolean).join("-")
  return joined.slice(0, MAX_LENGTH).replace(/-+$/, "")
}
