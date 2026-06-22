import { cookies, headers } from "next/headers";

import { themeProviderConfig, type ThemeName } from "@/lib/theme/config";

function isThemeName(value: string | undefined): value is ThemeName {
  return value === "light" || value === "dark" || value === "system";
}

function resolveSystemThemeFromHeaders(headerList: Headers): "light" | "dark" | null {
  const prefersColorScheme = headerList.get("sec-ch-prefers-color-scheme");
  if (prefersColorScheme === "dark") {
    return "dark";
  }
  if (prefersColorScheme === "light") {
    return "light";
  }
  return null;
}

export async function getServerThemePreference(): Promise<ThemeName> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(themeProviderConfig.storageKey)?.value;

  if (isThemeName(stored)) {
    return stored;
  }

  return themeProviderConfig.defaultTheme as ThemeName;
}

export async function getServerResolvedThemeClass(): Promise<"light" | "dark" | undefined> {
  const preference = await getServerThemePreference();

  if (preference === "dark") {
    return "dark";
  }

  if (preference === "light") {
    return "light";
  }

  const headerList = await headers();
  const systemTheme = resolveSystemThemeFromHeaders(headerList);
  return systemTheme ?? undefined;
}
