"use client";

import { useSyncExternalStore } from "react";

import { usePlaygroundScoreContext } from "@/components/playground/playground-score-provider";
import { PlaygroundGameCard } from "@/components/playground/playground-game-card";
import { StaggerItem } from "@/components/motion/stagger-children";
import { getBestScoreHighlight as getBreakoutHighlight, subscribeBreakoutStorage } from "@/lib/breakout/storage";
import { playgroundGames, type PlaygroundGameId } from "@/lib/data/playground-games";
import { getBestRunHighlight, subscribePromptRunStorage } from "@/lib/prompt-run/storage";
import { getBestScoreHighlight, subscribeTypeRacerStorage } from "@/lib/type-racer/storage";

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

function useBreakoutHighlight(): string | null {
  const { cloudScores } = usePlaygroundScoreContext();

  return useSyncExternalStore(
    subscribeBreakoutStorage,
    () => getBreakoutHighlight(cloudScores.breakout),
    () => null,
  );
}

export function PlaygroundHubGames() {
  const typeRacerStat = useTypeRacerHighlight();
  const promptRunStat = usePromptRunHighlight();
  const breakoutStat = useBreakoutHighlight();

  const localStats: Partial<Record<PlaygroundGameId, string | null>> = {
    "type-racer": typeRacerStat,
    "prompt-run": promptRunStat,
    breakout: breakoutStat,
  };

  return (
    <>
      {playgroundGames.map((game) => (
        <StaggerItem key={game.id}>
          <PlaygroundGameCard
            title={game.title}
            description={game.description}
            href={game.href}
            status={game.status}
            localStat={localStats[game.id]}
            eyebrow={game.eyebrow}
            ctaLabel={game.ctaLabel}
          />
        </StaggerItem>
      ))}
    </>
  );
}
