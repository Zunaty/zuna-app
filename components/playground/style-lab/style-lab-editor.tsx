"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStyleLab } from "@/lib/style-lab/style-lab-provider";
import {
  ACCENT_SWATCHES,
  FONT_PAIRING_IDS,
  FONT_PAIRING_LABELS,
  FONT_PAIRING_VARS,
  RADIUS_MAX_REM,
  RADIUS_MIN_REM,
  RADIUS_STEP_REM,
  STYLE_LAB_PRESETS,
  type StyleLabPresetId,
} from "@/lib/style-lab/config";
import { parseHueFromHslChannels } from "@/lib/style-lab/derive";
import { cn } from "@/lib/utils";

function parseRadiusRem(radius: string): number {
  const match = /^(\d+(?:\.\d+)?)rem$/.exec(radius.trim());
  if (!match) {
    return 0.625;
  }
  return Number(match[1]);
}

function nearestSwatchHue(primary: string): number | null {
  const hue = parseHueFromHslChannels(primary);
  if (hue === null) {
    return null;
  }

  let best: (typeof ACCENT_SWATCHES)[number] | null = null;
  let bestDelta = Infinity;
  for (const swatch of ACCENT_SWATCHES) {
    const delta = Math.min(Math.abs(swatch.hue - hue), 360 - Math.abs(swatch.hue - hue));
    if (delta < bestDelta) {
      bestDelta = delta;
      best = swatch;
    }
  }

  return bestDelta <= 8 ? (best?.hue ?? null) : null;
}

export function StyleLabEditor() {
  const { preference, applyPreset, setRadius, setFontPairing, setAccentHue, reset } = useStyleLab();
  const radiusRem = parseRadiusRem(preference.radius);
  const activeSwatchHue = nearestSwatchHue(preference.light.primary);

  return (
    <div className="space-y-10">
      <section className="space-y-3" aria-labelledby="style-lab-presets">
        <div>
          <h2 id="style-lab-presets" className="text-lg font-semibold tracking-tight">
            Presets
          </h2>
          <p className="text-sm text-muted-foreground">Pick a starting look — changes apply across the whole site.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {STYLE_LAB_PRESETS.map((preset) => {
            const selected = preference.presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id as StyleLabPresetId)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  selected ? "border-primary bg-accent/60" : "border-border hover:border-primary/40 hover:bg-muted/40",
                )}
                aria-pressed={selected}
              >
                <p className="font-medium">{preset.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{preset.description}</p>
                <div className="mt-3 flex gap-2" aria-hidden>
                  <span
                    className="size-5 rounded-full border border-border"
                    style={{ backgroundColor: `hsl(${preset.preference.light.primary})` }}
                  />
                  <span
                    className="size-5 border border-border bg-background"
                    style={{ borderRadius: preset.preference.radius }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="style-lab-preview">
        <div>
          <h2 id="style-lab-preview" className="text-lg font-semibold tracking-tight">
            Live preview
          </h2>
          <p className="text-sm text-muted-foreground">Sample UI using the active tokens.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Primary actions</CardTitle>
            <CardDescription>Buttons, inputs, and accent surfaces update with your choices.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="style-lab-sample-input">Sample field</Label>
              <Input id="style-lab-sample-input" placeholder="Type something…" defaultValue="Style Lab" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button">Primary</Button>
              <Button type="button" variant="outline">
                Outline
              </Button>
              <Button type="button" variant="secondary">
                Secondary
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="style-lab-advanced">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="style-lab-advanced" className="text-lg font-semibold tracking-tight">
              Fine-tune
            </h2>
            <p className="text-sm text-muted-foreground">
              Tweaking any control marks the style as custom
              {preference.presetId === "custom" ? " (active)." : "."}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset to default
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="style-lab-radius">Border radius</Label>
            <span className="text-xs tabular-nums text-muted-foreground">{radiusRem.toFixed(3)}rem</span>
          </div>
          <input
            id="style-lab-radius"
            type="range"
            min={RADIUS_MIN_REM}
            max={RADIUS_MAX_REM}
            step={RADIUS_STEP_REM}
            value={radiusRem}
            onChange={(event) => setRadius(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium leading-none">Accent</p>
          <div className="flex flex-wrap gap-2">
            {ACCENT_SWATCHES.map((swatch) => {
              const selected = activeSwatchHue === swatch.hue;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  onClick={() => setAccentHue(swatch.hue)}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    selected ? "border-primary bg-accent" : "border-border hover:border-primary/40",
                  )}
                  aria-pressed={selected}
                  aria-label={`Accent ${swatch.label}`}
                >
                  <span
                    className="size-4 rounded-full border border-border"
                    style={{ backgroundColor: `hsl(${swatch.hue} 83% 58%)` }}
                  />
                  {swatch.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium leading-none">Font pairing</p>
          <div className="flex flex-wrap gap-2">
            {FONT_PAIRING_IDS.map((fontId) => {
              const selected = preference.fontPairing === fontId;
              return (
                <button
                  key={fontId}
                  type="button"
                  onClick={() => setFontPairing(fontId)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    selected ? "border-primary bg-accent" : "border-border hover:border-primary/40",
                  )}
                  style={{ fontFamily: `var(${FONT_PAIRING_VARS[fontId]})` }}
                  aria-pressed={selected}
                >
                  {FONT_PAIRING_LABELS[fontId]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        Light/dark mode still uses the header toggle. Prefer the{" "}
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          home page
        </Link>{" "}
        to see how the look carries across the portfolio.
      </p>
    </div>
  );
}
