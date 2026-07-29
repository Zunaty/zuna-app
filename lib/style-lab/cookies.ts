import { STYLE_LAB_STORAGE_KEY, type StyleLabPreference } from "@/lib/style-lab/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function writeStyleLabCookie(preference: StyleLabPreference): void {
  const encoded = encodeURIComponent(JSON.stringify(preference));
  document.cookie = `${STYLE_LAB_STORAGE_KEY}=${encoded};path=/;max-age=${ONE_YEAR_SECONDS};SameSite=Lax`;
}
