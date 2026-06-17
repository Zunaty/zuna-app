const DEFAULT_FALLBACK = "/";

/**
 * Normalises a user-supplied `next` redirect into a safe same-origin path.
 */
export function safeRedirect(next: string | null | undefined, fallback: string = DEFAULT_FALLBACK): string {
  if (typeof next !== "string") return fallback;

  const trimmed = next.trim();
  if (trimmed.length === 0) return fallback;
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return fallback;

  return trimmed;
}
