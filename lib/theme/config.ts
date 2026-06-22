export const THEME_STORAGE_KEY = "theme";

export const themeProviderConfig = {
  attribute: "class" as const,
  defaultTheme: "system",
  enableSystem: true,
  disableTransitionOnChange: true,
  enableColorScheme: true,
  storageKey: THEME_STORAGE_KEY,
  themes: ["light", "dark"] as const,
};

export type ThemeName = (typeof themeProviderConfig.themes)[number] | "system";
