import { describe, expect, it } from "vitest";

import { DEFAULT_STYLE_LAB_PREFERENCE } from "@/lib/style-lab/config";
import { colorSetFromHue, parseHueFromHslChannels } from "@/lib/style-lab/derive";
import { parseStyleLabPreference } from "@/lib/style-lab/parse";

describe("parseStyleLabPreference", () => {
  it("returns defaults for invalid payloads", () => {
    expect(parseStyleLabPreference(null)).toEqual(DEFAULT_STYLE_LAB_PREFERENCE);
    expect(parseStyleLabPreference("nope")).toEqual(DEFAULT_STYLE_LAB_PREFERENCE);
  });

  it("keeps valid fields and repairs invalid ones", () => {
    const parsed = parseStyleLabPreference({
      presetId: "soft",
      radius: "not-a-radius",
      fontPairing: "dm-sans",
      light: { primary: "221 83% 53%" },
      dark: DEFAULT_STYLE_LAB_PREFERENCE.dark,
    });

    expect(parsed.presetId).toBe("soft");
    expect(parsed.fontPairing).toBe("dm-sans");
    expect(parsed.radius).toBe(DEFAULT_STYLE_LAB_PREFERENCE.radius);
    expect(parsed.light.primary).toBe("221 83% 53%");
    expect(parsed.light.accent).toBe(DEFAULT_STYLE_LAB_PREFERENCE.light.accent);
  });
});

describe("colorSetFromHue", () => {
  it("builds light and dark families from a hue", () => {
    const light = colorSetFromHue(221, "light");
    const dark = colorSetFromHue(221, "dark");
    expect(light.primary.startsWith("221 ")).toBe(true);
    expect(dark.primary.startsWith("221 ")).toBe(true);
    expect(parseHueFromHslChannels(light.ring)).toBe(221);
  });
});
