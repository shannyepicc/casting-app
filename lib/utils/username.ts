/**
 * Convert a full name into a URL-safe username slug.
 * "Maya Reyes"     → "maya-reyes"
 * "D'Angelo Cruz"  → "dangelo-cruz"
 * "Shanmukh Gakkani" → "shanmukh-gakkani"
 */
export function toUsername(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Append an incrementing numeric suffix for collision handling.
 * toUsernameWithSuffix("maya-reyes", 1) → "maya-reyes-1"
 * toUsernameWithSuffix("maya-reyes", 2) → "maya-reyes-2"
 */
export function toUsernameWithSuffix(base: string, n: number): string {
  return `${base}-${n}`;
}
