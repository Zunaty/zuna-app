import { cookies } from "next/headers";
import type { CSSProperties } from "react";

import { DEFAULT_STYLE_LAB_PREFERENCE, STYLE_LAB_STORAGE_KEY, type StyleLabPreference } from "@/lib/style-lab/config";
import { getStyleLabCssVars, styleLabVarsToReactStyle } from "@/lib/style-lab/apply";
import { parseStyleLabPreferenceRaw } from "@/lib/style-lab/storage";
import { getServerResolvedThemeClass } from "@/lib/theme/server";

export async function getServerStyleLabPreference(): Promise<StyleLabPreference> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(STYLE_LAB_STORAGE_KEY)?.value;
  if (!stored) {
    return DEFAULT_STYLE_LAB_PREFERENCE;
  }
  return parseStyleLabPreferenceRaw(stored);
}

/** Style object for `<html>` so first paint matches stored Style Lab prefs. */
export async function getServerStyleLabHtmlStyle(): Promise<CSSProperties> {
  const [preference, themeClass] = await Promise.all([getServerStyleLabPreference(), getServerResolvedThemeClass()]);
  const mode = themeClass === "dark" ? "dark" : "light";
  return styleLabVarsToReactStyle(getStyleLabCssVars(preference, mode));
}
