/** Post-auth destination after setting a new password via recovery email. */
export const UPDATE_PASSWORD_PATH = "/auth/update-password";

/** Builds the Supabase `redirectTo` / `emailRedirectTo` URL for PKCE callback flows. */
export function buildAuthCallbackUrl(next: string): string {
  const nextParam = encodeURIComponent(next);

  if (typeof window === "undefined") {
    return `/auth/callback?next=${nextParam}`;
  }

  return `${window.location.origin}/auth/callback?next=${nextParam}`;
}

export function buildPasswordResetRedirectUrl(): string {
  return buildAuthCallbackUrl(UPDATE_PASSWORD_PATH);
}
