/**
 * Convert a full name into a URL-safe username slug.
 * "Maya Reyes" → "maya-reyes"
 * "D'Angelo Cruz" → "dangelo-cruz"
 */
export function toUsername(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Append a random 4-digit suffix to handle username collisions.
 * "maya-reyes" → "maya-reyes-4821"
 */
export function toUsernameWithSuffix(fullName: string): string {
  const base = toUsername(fullName);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${suffix}`;
}
