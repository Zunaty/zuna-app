"use client";

import { useSyncExternalStore } from "react";

import { usePlaygroundScoreContext } from "@/components/playground/playground-score-provider";
import { PlaygroundGameCard } from "@/components/playground/playground-game-card";
import { StaggerItem } from "@/components/motion/stagger-children";
import { getBestScoreHighlight as getBreakoutHighlight, subscribeBreakoutStorage } from "@/lib/breakout/storage";
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
      <StaggerItem>
        <PlaygroundGameCard
          title="Breakout"
          description="Retro brick breaker on canvas — classic levels, or draft boons and curses in Roguelite mode."
          href="/playground/breakout"
          status="live"
          localStat={breakoutStat}
        />
      </StaggerItem>
      <StaggerItem>
        <PlaygroundGameCard
          title="Style Lab"
          description="Restyle the whole site — presets plus knobs for radius, accent color, and fonts."
          href="/playground/style-lab"
          status="live"
          eyebrow="Experiment"
          ctaLabel="Open"
        />
      </StaggerItem>
    </>
  );
}
