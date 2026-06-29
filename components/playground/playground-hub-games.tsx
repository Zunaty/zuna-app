"use client";

import { useSyncExternalStore } from "react";

import { usePlaygroundScoreContext } from "@/components/playground/playground-score-provider";
import { PlaygroundGameCard } from "@/components/playground/playground-game-card";
import { StaggerItem } from "@/components/motion/stagger-children";
import { getBestRunHighlight, subscribePromptRunStorage } from "@/lib/prompt-run/storage";
import { getBestScoreHighlight, TYPE_RACER_STORAGE_EVENT } from "@/lib/type-racer/storage";

function subscribeTypeRacerStorage(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener(TYPE_RACER_STORAGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(TYPE_RACER_STORAGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function useTypeRacerHighlight(): string | null {
  const { cloudScores } = usePlaygroundScoreContext();

  return useSyncExternalStore(
    subscribeTypeRacerStorage,
    () => getBestScoreHighlight(cloudScores.typeRacer),
    () => null,
  );
}

function usePromptRunHighlight(): string | null {
  const { cloudScores } = usePlaygroundScoreContext();

  return useSyncExternalStore(
    subscribePromptRunStorage,
    () => getBestRunHighlight(cloudScores.promptRun),
    () => null,
  );
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
