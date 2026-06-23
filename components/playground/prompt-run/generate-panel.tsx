"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGeneratedImageFilename } from "@/lib/prompt-run/download-image";
import type { GeneratedImage, Round } from "@/lib/prompt-run/types";
import { cn } from "@/lib/utils";

import { DownloadImageButton } from "./download-image-button";
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
};

export function GeneratePanel({ prompt, rounds, existingImage, onImageGenerated, onContinue }: GeneratePanelProps) {
  const lastRoundId = rounds[rounds.length - 1]?.id ?? null;
  const [generationEnabled, setGenerationEnabled] = useState<boolean | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);

  const image = existingImage ?? null;
  const lastRoundNumber = rounds[rounds.length - 1]?.roundNumber;

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

  const generateImage = useCallback(async () => {
    if (!prompt.trim() || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    setTruncated(false);

    try {
      const response = await fetch("/api/playground/prompt-run/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = (await response.json()) as GenerateResponse;

      if (!response.ok) {
        setError(data.error ?? "Failed to generate image.");
        return;
      }

      const firstImage = data.images[0];
      if (!firstImage) {
        setError("No image was returned.");
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
    } catch {
      setError("Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, onImageGenerated, prompt]);

  const statusMessage =
    generationEnabled === null
      ? "Checking generation availability…"
      : generationEnabled
        ? "Generate an image from your assembled prompt with FLUX.2 Turbo."
        : "Image generation is unavailable — add FAL_KEY to enable it.";

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

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {image && !isGenerating ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt="Generated from your prompt"
                  className="mx-auto max-h-[min(70vh,640px)] w-full object-contain"
                  width={image.width}
                  height={image.height}
                />
              </div>
              <DownloadImageButton url={image.url} filename={getGeneratedImageFilename(lastRoundNumber, image.seed)} />
            </div>
          ) : (
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
                <p className="text-sm text-muted-foreground">No image yet.</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {generationEnabled ? (
              <Button type="button" onClick={() => void generateImage()} disabled={!prompt.trim() || isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating…
                  </>
                ) : image ? (
                  "Regenerate"
                ) : (
                  "Generate image"
                )}
              </Button>
            ) : null}
            <Button type="button" variant={generationEnabled ? "outline" : "default"} onClick={onContinue}>
              Continue to overview
            </Button>
          </div>
        </CardContent>
      </Card>
      <RunHistory rounds={rounds} defaultExpandedRoundId={lastRoundId} title="This run" />
    </div>
  );
}
