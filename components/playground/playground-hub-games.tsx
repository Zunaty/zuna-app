"use client";

import { useSyncExternalStore } from "react";

import { PlaygroundGameCard } from "@/components/playground/playground-game-card";
import { StaggerItem } from "@/components/motion/stagger-children";
import { getBestRunHighlight, subscribePromptRunStorage } from "@/lib/prompt-run/storage";
import { getBestScoreHighlight } from "@/lib/type-racer/storage";

function subscribeTypeRacerStorage(onStoreChange: () => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === "zuna-type-racer-best") {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getTypeRacerHighlightSnapshot(): string | null {
  return getBestScoreHighlight();
}

function getPromptRunHighlightSnapshot(): string | null {
  return getBestRunHighlight();
}

function useTypeRacerHighlight(): string | null {
  return useSyncExternalStore(subscribeTypeRacerStorage, getTypeRacerHighlightSnapshot, () => null);
}

function usePromptRunHighlight(): string | null {
  return useSyncExternalStore(subscribePromptRunStorage, getPromptRunHighlightSnapshot, () => null);
}

export function PlaygroundHubGames() {
  const typeRacerStat = useTypeRacerHighlight();
  const promptRunStat = usePromptRunHighlight();

  return (
    <>
      <StaggerItem>
        <PlaygroundGameCard
          title="Type Racer"
          description="Timed typing tests — random words, sentences, or paragraphs with WPM and accuracy scoring."
          href="/playground/type-racer"
          status="live"
          localStat={typeRacerStat}
        />
      </StaggerItem>
      <StaggerItem>
        <PlaygroundGameCard
          title="Prompt Run"
          description="Roguelike prompt builder — draft categories, shop for buffs, then generate art from your run."
          href="/playground/prompt-run"
          status="live"
          localStat={promptRunStat}
        />
      </StaggerItem>
    </>
  );
}
