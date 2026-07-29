import { FONT_PAIRING_VARS, type StyleLabPreference } from "@/lib/style-lab/config";
import type { CSSProperties } from "react";

export type StyleLabCssVars = {
  "--primary": string;
  "--primary-foreground": string;
  "--accent": string;
  "--accent-foreground": string;
  "--ring": string;
  "--chart-1": string;
  "--radius": string;
  "--font-sans": string;
};

export function getStyleLabCssVars(preference: StyleLabPreference, mode: "light" | "dark"): StyleLabCssVars {
  const colors = preference[mode];
  const fontVar = FONT_PAIRING_VARS[preference.fontPairing];

  return {
    "--primary": colors.primary,
    "--primary-foreground": colors.primaryForeground,
    "--accent": colors.accent,
    "--accent-foreground": colors.accentForeground,
    "--ring": colors.ring,
    "--chart-1": colors.primary,
    "--radius": preference.radius,
    // Resolve against the same element that defines next/font variables (`<html>`).
    "--font-sans": `var(${fontVar})`,
  };
}

/** React-friendly style object for SSR on `<html>`. */
export function styleLabVarsToReactStyle(vars: StyleLabCssVars): CSSProperties {
  return vars as unknown as CSSProperties;
}

export function applyStyleLabToDom(preference: StyleLabPreference, mode: "light" | "dark"): void {
  const root = document.documentElement;
  const vars = getStyleLabCssVars(preference, mode);
  for (const [key, value] of Object.entries(vars) as [keyof StyleLabCssVars, string][]) {
    root.style.setProperty(key, value);
  }
}
