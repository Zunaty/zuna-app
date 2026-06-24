"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeFailedGenerationBonus, computeScrapBonus } from "@/lib/prompt-run/scoring";
import type { GeneratedImage, Round } from "@/lib/prompt-run/types";
import { cn } from "@/lib/utils";

import { RunHistory } from "./run-history";

type GenerateResponse = {
  images: Array<{ url: string; width?: number; height?: number }>;
  seed?: number;
  truncated?: boolean;
  error?: string;
};

type GeneratePanelProps = {
  prompt: string;
  rounds: Round[];
  existingImage?: GeneratedImage | null;
  onImageGenerated: (image: GeneratedImage) => void;
  onContinue: () => void;
  onScrap: () => void;
  onGenerationFailed: (message: string) => void;
  canScrap: boolean;
};

export function GeneratePanel({
  prompt,
  rounds,
  existingImage,
  onImageGenerated,
  onContinue,
  onScrap,
  onGenerationFailed,
  canScrap,
}: GeneratePanelProps) {
  const lastRoundId = rounds[rounds.length - 1]?.id ?? null;
  const [generationEnabled, setGenerationEnabled] = useState<boolean | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const image = existingImage ?? null;
  const lastRoundScore = rounds[rounds.length - 1]?.roundScore ?? 0;
  const scrapBonus = computeScrapBonus(lastRoundScore);
  const failedGenerationBonus = computeFailedGenerationBonus(lastRoundScore);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/playground/prompt-run/generate");
        if (!response.ok) {
          if (!cancelled) {
            setGenerationEnabled(false);
          }
          return;
        }
        const data = (await response.json()) as { enabled?: boolean };
        if (!cancelled) {
          setGenerationEnabled(Boolean(data.enabled));
        }
      } catch {
        if (!cancelled) {
          setGenerationEnabled(false);
        }
      }
    }

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerationFailure = useCallback(
    (message: string) => {
      onGenerationFailed(message);
    },
    [onGenerationFailed],
  );

  const generateImage = useCallback(async () => {
    if (!prompt.trim() || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setTruncated(false);

    try {
      const response = await fetch("/api/playground/prompt-run/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = (await response.json()) as GenerateResponse;

      if (!response.ok) {
        handleGenerationFailure(data.error ?? "Failed to generate image.");
        return;
      }

      const firstImage = data.images[0];
      if (!firstImage) {
        handleGenerationFailure("No image was returned.");
        return;
      }

      const generated: GeneratedImage = {
        url: firstImage.url,
        width: firstImage.width,
        height: firstImage.height,
        seed: data.seed,
      };

      setTruncated(Boolean(data.truncated));
      onImageGenerated(generated);
      onContinue();
    } catch {
      handleGenerationFailure("Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  }, [handleGenerationFailure, isGenerating, onContinue, onImageGenerated, prompt]);

  const statusMessage =
    generationEnabled === null
      ? "Checking generation availability…"
      : generationEnabled
        ? "Generate an image from your assembled prompt, or scrap it for bonus points."
        : "Image generation is unavailable — scrap your prompt to continue.";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your prompt</CardTitle>
          <CardDescription>{statusMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">{prompt || "No prompt yet."}</p>

          {truncated ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Prompt was trimmed to 500 characters for generation.
            </p>
          ) : null}

          <div
            className={cn(
              "flex min-h-48 items-center justify-center rounded-lg border border-dashed bg-muted/10",
              isGenerating && "animate-pulse",
            )}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Generating image…
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Your image will appear on the overview after generation.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {generationEnabled && !image ? (
              <Button type="button" onClick={() => void generateImage()} disabled={!prompt.trim() || isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate image"
                )}
              </Button>
            ) : null}
            {canScrap && !image ? (
              <Button
                type="button"
                variant={generationEnabled ? "outline" : "default"}
                onClick={onScrap}
                disabled={isGenerating}
              >
                Scrap prompt (+{scrapBonus} pts)
              </Button>
            ) : null}
          </div>
          {canScrap && !image ? (
            <p className="text-xs text-muted-foreground">
              Scrapping skips generation and awards one-third of the round score as bonus points. Your streak resets. If
              generation fails, you earn double that amount (+{failedGenerationBonus} pts) and continue to the overview.
            </p>
          ) : null}
        </CardContent>
      </Card>
      <RunHistory rounds={rounds} defaultExpandedRoundId={lastRoundId} title="This run" />
    </div>
  );
}
