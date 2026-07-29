"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  DEFAULT_STYLE_LAB_PREFERENCE,
  getPresetById,
  type StyleLabPreference,
  type StyleLabPresetId,
} from "@/lib/style-lab/config";
import { applyStyleLabToDom } from "@/lib/style-lab/apply";
import { writeStyleLabCookie } from "@/lib/style-lab/cookies";
import { colorSetFromHue } from "@/lib/style-lab/derive";
import {
  getStyleLabPreferenceSnapshot,
  saveStyleLabPreference,
  subscribeStyleLabPreference,
} from "@/lib/style-lab/storage";
import { useTheme } from "@/lib/theme/theme-provider";

type StyleLabContextValue = {
  preference: StyleLabPreference;
  setPreference: (preference: StyleLabPreference) => void;
  applyPreset: (presetId: StyleLabPresetId) => void;
  setRadius: (radiusRem: number) => void;
  setFontPairing: (fontPairing: StyleLabPreference["fontPairing"]) => void;
  setAccentHue: (hue: number) => void;
  reset: () => void;
};

const StyleLabContext = createContext<StyleLabContextValue | undefined>(undefined);

type StyleLabProviderProps = {
  children: ReactNode;
  initialPreference: StyleLabPreference;
};

export function StyleLabProvider({ children, initialPreference }: StyleLabProviderProps) {
  const preference = useSyncExternalStore(
    subscribeStyleLabPreference,
    getStyleLabPreferenceSnapshot,
    () => initialPreference,
  );
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";

  const persist = useCallback((next: StyleLabPreference) => {
    saveStyleLabPreference(next);
    writeStyleLabCookie(next);
  }, []);

  useEffect(() => {
    writeStyleLabCookie(preference);
    applyStyleLabToDom(preference, mode);
  }, [mode, preference]);

  const setPreference = useCallback(
    (next: StyleLabPreference) => {
      persist(next);
    },
    [persist],
  );

  const applyPreset = useCallback(
    (presetId: StyleLabPresetId) => {
      persist(getPresetById(presetId).preference);
    },
    [persist],
  );

  const setRadius = useCallback(
    (radiusRem: number) => {
      const clamped = Math.min(1.5, Math.max(0, radiusRem));
      const radius = `${Number(clamped.toFixed(3))}rem`;
      persist({ ...getStyleLabPreferenceSnapshot(), presetId: "custom", radius });
    },
    [persist],
  );

  const setFontPairing = useCallback(
    (fontPairing: StyleLabPreference["fontPairing"]) => {
      persist({ ...getStyleLabPreferenceSnapshot(), presetId: "custom", fontPairing });
    },
    [persist],
  );

  const setAccentHue = useCallback(
    (hue: number) => {
      const current = getStyleLabPreferenceSnapshot();
      persist({
        ...current,
        presetId: "custom",
        light: colorSetFromHue(hue, "light"),
        dark: colorSetFromHue(hue, "dark"),
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    persist(DEFAULT_STYLE_LAB_PREFERENCE);
  }, [persist]);

  const value = useMemo<StyleLabContextValue>(
    () => ({
      preference,
      setPreference,
      applyPreset,
      setRadius,
      setFontPairing,
      setAccentHue,
      reset,
    }),
    [applyPreset, preference, reset, setAccentHue, setFontPairing, setPreference, setRadius],
  );

  return <StyleLabContext.Provider value={value}>{children}</StyleLabContext.Provider>;
}

export function useStyleLab(): StyleLabContextValue {
  const context = useContext(StyleLabContext);
  if (!context) {
    throw new Error("useStyleLab must be used within StyleLabProvider");
  }
  return context;
}
