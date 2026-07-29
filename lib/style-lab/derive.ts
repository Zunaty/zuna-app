import type { StyleLabColorSet } from "@/lib/style-lab/config";

/** Build a readable light/dark primary family from a single hue. */
export function colorSetFromHue(hue: number, mode: "light" | "dark"): StyleLabColorSet {
  const h = Math.round(((hue % 360) + 360) % 360);

  if (mode === "light") {
    return {
      primary: `${h} 83% 58%`,
      primaryForeground: "0 0% 100%",
      accent: `${h} 60% 96%`,
      accentForeground: `${h} 50% 30%`,
      ring: `${h} 83% 58%`,
    };
  }

  return {
    primary: `${h} 70% 65%`,
    primaryForeground: "240 10% 4%",
    accent: `${h} 30% 16%`,
    accentForeground: `${h} 70% 80%`,
    ring: `${h} 70% 65%`,
  };
}

/** Parse leading hue from an HSL channel string like `262 83% 58%`. */
export function parseHueFromHslChannels(value: string): number | null {
  const match = /^(\d+(?:\.\d+)?)\s/.exec(value.trim());
  if (!match) {
    return null;
  }
  const hue = Number(match[1]);
  return Number.isFinite(hue) ? hue : null;
}
