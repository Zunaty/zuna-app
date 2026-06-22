import { themeProviderConfig } from "@/lib/theme/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function writeThemeCookie(theme: string): void {
  document.cookie = `${themeProviderConfig.storageKey}=${encodeURIComponent(theme)};path=/;max-age=${ONE_YEAR_SECONDS};SameSite=Lax`;
}
