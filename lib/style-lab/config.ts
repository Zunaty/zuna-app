import { LOCAL_STORAGE_KEYS } from "@/lib/storage/keys";

/** Cookie + localStorage key for Style Lab preferences. */
export const STYLE_LAB_STORAGE_KEY = LOCAL_STORAGE_KEYS.styleLab;

export const STYLE_LAB_CHANGE_EVENT = "zuna-style-lab-change";

export const STYLE_LAB_PRESET_IDS = ["default", "soft", "sharp", "contrast"] as const;
export type StyleLabPresetId = (typeof STYLE_LAB_PRESET_IDS)[number];
export type StyleLabPresetOrCustom = StyleLabPresetId | "custom";

export const FONT_PAIRING_IDS = ["geist", "dm-sans", "source-serif", "pixel"] as const;
export type FontPairingId = (typeof FONT_PAIRING_IDS)[number];

/** CSS variable each font pairing maps to (set by next/font on `<html>`). */
export const FONT_PAIRING_VARS: Record<FontPairingId, string> = {
  geist: "--font-geist-sans",
  "dm-sans": "--font-dm-sans",
  "source-serif": "--font-source-serif",
  pixel: "--font-pixel",
};

export const FONT_PAIRING_LABELS: Record<FontPairingId, string> = {
  geist: "Geist",
  "dm-sans": "DM Sans",
  "source-serif": "Source Serif",
  pixel: "Pixel",
};

export type StyleLabColorSet = {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
};

export type StyleLabPreference = {
  presetId: StyleLabPresetOrCustom;
  radius: string;
  fontPairing: FontPairingId;
  light: StyleLabColorSet;
  dark: StyleLabColorSet;
};

export type StyleLabPreset = {
  id: StyleLabPresetId;
  label: string;
  description: string;
  preference: StyleLabPreference;
};

/** Constrained accent swatches (hue degrees). */
export const ACCENT_SWATCHES = [
  { id: "violet", label: "Violet", hue: 262 },
  { id: "blue", label: "Blue", hue: 221 },
  { id: "teal", label: "Teal", hue: 173 },
  { id: "amber", label: "Amber", hue: 38 },
  { id: "rose", label: "Rose", hue: 346 },
] as const;

export type AccentSwatchId = (typeof ACCENT_SWATCHES)[number]["id"];

export const RADIUS_MIN_REM = 0;
export const RADIUS_MAX_REM = 1.5;
export const RADIUS_STEP_REM = 0.125;

/** Matches current `app/globals.css` light/dark primary family. */
export const DEFAULT_STYLE_LAB_PREFERENCE: StyleLabPreference = {
  presetId: "default",
  radius: "0.625rem",
  fontPairing: "geist",
  light: {
    primary: "262 83% 58%",
    primaryForeground: "0 0% 100%",
    accent: "262 60% 96%",
    accentForeground: "262 50% 30%",
    ring: "262 83% 58%",
  },
  dark: {
    primary: "263 70% 65%",
    primaryForeground: "240 10% 4%",
    accent: "262 30% 16%",
    accentForeground: "263 70% 80%",
    ring: "263 70% 65%",
  },
};

export const STYLE_LAB_PRESETS: StyleLabPreset[] = [
  {
    id: "default",
    label: "Default",
    description: "Portfolio violet with balanced corners.",
    preference: DEFAULT_STYLE_LAB_PREFERENCE,
  },
  {
    id: "soft",
    label: "Soft",
    description: "Rounded edges and a calm blue accent.",
    preference: {
      presetId: "soft",
      radius: "1rem",
      fontPairing: "dm-sans",
      light: {
        primary: "221 83% 53%",
        primaryForeground: "0 0% 100%",
        accent: "221 60% 96%",
        accentForeground: "221 50% 28%",
        ring: "221 83% 53%",
      },
      dark: {
        primary: "217 70% 65%",
        primaryForeground: "240 10% 4%",
        accent: "221 30% 16%",
        accentForeground: "217 70% 82%",
        ring: "217 70% 65%",
      },
    },
  },
  {
    id: "sharp",
    label: "Sharp",
    description: "Zero radius with a crisp teal punch.",
    preference: {
      presetId: "sharp",
      radius: "0rem",
      fontPairing: "geist",
      light: {
        primary: "173 72% 36%",
        primaryForeground: "0 0% 100%",
        accent: "173 45% 94%",
        accentForeground: "173 55% 22%",
        ring: "173 72% 36%",
      },
      dark: {
        primary: "173 60% 48%",
        primaryForeground: "240 10% 4%",
        accent: "173 28% 14%",
        accentForeground: "173 55% 78%",
        ring: "173 60% 48%",
      },
    },
  },
  {
    id: "contrast",
    label: "Contrast",
    description: "Tight corners and a high-contrast rose.",
    preference: {
      presetId: "contrast",
      radius: "0.25rem",
      fontPairing: "source-serif",
      light: {
        primary: "346 77% 50%",
        primaryForeground: "0 0% 100%",
        accent: "346 55% 95%",
        accentForeground: "346 60% 28%",
        ring: "346 77% 50%",
      },
      dark: {
        primary: "346 75% 62%",
        primaryForeground: "240 10% 4%",
        accent: "346 30% 14%",
        accentForeground: "346 70% 82%",
        ring: "346 75% 62%",
      },
    },
  },
];

export function getPresetById(id: StyleLabPresetId): StyleLabPreset {
  const preset = STYLE_LAB_PRESETS.find((entry) => entry.id === id);
  return preset ?? STYLE_LAB_PRESETS[0];
}
