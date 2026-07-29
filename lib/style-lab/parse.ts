import {
  DEFAULT_STYLE_LAB_PREFERENCE,
  FONT_PAIRING_IDS,
  STYLE_LAB_PRESET_IDS,
  type FontPairingId,
  type StyleLabColorSet,
  type StyleLabPreference,
  type StyleLabPresetOrCustom,
} from "@/lib/style-lab/config";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHslChannels(value: unknown): value is string {
  return typeof value === "string" && /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(value.trim());
}

function isRadius(value: unknown): value is string {
  return typeof value === "string" && /^\d+(\.\d+)?rem$/.test(value.trim());
}

function isFontPairing(value: unknown): value is FontPairingId {
  return typeof value === "string" && (FONT_PAIRING_IDS as readonly string[]).includes(value);
}

function isPresetId(value: unknown): value is StyleLabPresetOrCustom {
  return (
    value === "custom" || (typeof value === "string" && (STYLE_LAB_PRESET_IDS as readonly string[]).includes(value))
  );
}

function parseColorSet(value: unknown, fallback: StyleLabColorSet): StyleLabColorSet {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    primary: isHslChannels(value.primary) ? value.primary : fallback.primary,
    primaryForeground: isHslChannels(value.primaryForeground) ? value.primaryForeground : fallback.primaryForeground,
    accent: isHslChannels(value.accent) ? value.accent : fallback.accent,
    accentForeground: isHslChannels(value.accentForeground) ? value.accentForeground : fallback.accentForeground,
    ring: isHslChannels(value.ring) ? value.ring : fallback.ring,
  };
}

/** Validate and normalize an unknown preference payload. */
export function parseStyleLabPreference(value: unknown): StyleLabPreference {
  if (!isRecord(value)) {
    return DEFAULT_STYLE_LAB_PREFERENCE;
  }

  return {
    presetId: isPresetId(value.presetId) ? value.presetId : "custom",
    radius: isRadius(value.radius) ? value.radius : DEFAULT_STYLE_LAB_PREFERENCE.radius,
    fontPairing: isFontPairing(value.fontPairing) ? value.fontPairing : DEFAULT_STYLE_LAB_PREFERENCE.fontPairing,
    light: parseColorSet(value.light, DEFAULT_STYLE_LAB_PREFERENCE.light),
    dark: parseColorSet(value.dark, DEFAULT_STYLE_LAB_PREFERENCE.dark),
  };
}
