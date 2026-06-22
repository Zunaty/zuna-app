"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { writeThemeCookie } from "@/lib/theme/cookies";
import { themeProviderConfig, type ThemeName } from "@/lib/theme/config";

const SYSTEM_MEDIA_QUERY = "(prefers-color-scheme: dark)";
const THEME_CHANGE_EVENT = "zuna-theme-change";

type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  themes: string[];
  theme?: string;
  setTheme: Dispatch<SetStateAction<string>>;
  resolvedTheme?: ResolvedTheme;
  systemTheme?: ResolvedTheme;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(themeProviderConfig.storageKey);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Ignore storage errors.
  }

  return themeProviderConfig.defaultTheme as ThemeName;
}

function getSystemTheme(media: MediaQueryList = window.matchMedia(SYSTEM_MEDIA_QUERY)): ResolvedTheme {
  return media.matches ? "dark" : "light";
}

function resolveTheme(theme: ThemeName, systemTheme: ResolvedTheme): ResolvedTheme {
  return theme === "system" ? systemTheme : theme;
}

function subscribeToTheme(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === themeProviderConfig.storageKey) {
      callback();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

function subscribeToSystemTheme(callback: () => void) {
  const media = window.matchMedia(SYSTEM_MEDIA_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function disableTransitions(nonce?: string) {
  const style = document.createElement("style");
  if (nonce) {
    style.setAttribute("nonce", nonce);
  }
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}",
    ),
  );
  document.head.appendChild(style);
  return () => {
    window.getComputedStyle(document.body);
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1);
  };
}

function applyThemeToDom(theme: ResolvedTheme, nonce?: string) {
  const restoreTransitions = themeProviderConfig.disableTransitionOnChange ? disableTransitions(nonce) : null;
  const root = document.documentElement;
  const { themes, attribute } = themeProviderConfig;

  root.classList.remove(...themes);
  root.classList.add(theme);

  if (attribute !== "class") {
    root.setAttribute(attribute, theme);
  }

  if (themeProviderConfig.enableColorScheme) {
    root.style.colorScheme = theme;
  }

  restoreTransitions?.();
}

function persistTheme(theme: ThemeName) {
  try {
    localStorage.setItem(themeProviderConfig.storageKey, theme);
  } catch {
    // Ignore storage errors.
  }

  writeThemeCookie(theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

type ThemeProviderProps = {
  children: ReactNode;
  initialTheme: ThemeName;
  forcedTheme?: string;
  nonce?: string;
};

export function ThemeProvider({ children, initialTheme, forcedTheme, nonce }: ThemeProviderProps) {
  const theme = useSyncExternalStore(subscribeToTheme, readStoredTheme, () => initialTheme);
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, () => "light" as ResolvedTheme);

  const activeTheme = (forcedTheme as ThemeName | undefined) ?? theme;
  const resolvedTheme = resolveTheme(activeTheme, systemTheme);

  const setTheme = useCallback<Dispatch<SetStateAction<string>>>((value) => {
    const current = readStoredTheme();
    const next = typeof value === "function" ? value(current) : value;
    persistTheme(next as ThemeName);
  }, []);

  useEffect(() => {
    writeThemeCookie(readStoredTheme());
    applyThemeToDom(forcedTheme ? (forcedTheme as ResolvedTheme) : resolvedTheme, nonce);
  }, [forcedTheme, nonce, resolvedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: activeTheme,
      setTheme,
      resolvedTheme,
      systemTheme: themeProviderConfig.enableSystem ? systemTheme : undefined,
      themes: themeProviderConfig.enableSystem
        ? [...themeProviderConfig.themes, "system"]
        : [...themeProviderConfig.themes],
    }),
    [activeTheme, resolvedTheme, setTheme, systemTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
