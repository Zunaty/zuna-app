"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { BreakoutMode } from "@/lib/breakout/constants";
import type { BreakoutBestScore } from "@/lib/breakout/scoring";
import type { PlaygroundCloudScores } from "@/lib/playground/merge-scores";
import { usePlaygroundCloudSync } from "@/lib/playground/use-playground-cloud-sync";
import type { PromptRunBestRun } from "@/lib/prompt-run/storage";
import type { TypeRacerMode } from "@/lib/type-racer/constants";
import type { TypeRacerBestScore } from "@/lib/type-racer/storage";

type PlaygroundScoreContextValue = {
  isAuthenticated: boolean;
  cloudScores: PlaygroundCloudScores;
  persistTypeRacerBest: (mode: TypeRacerMode, score: TypeRacerBestScore) => void;
  persistPromptRunBest: (best: PromptRunBestRun) => void;
  persistBreakoutBest: (mode: BreakoutMode, score: BreakoutBestScore) => void;
};

const PlaygroundScoreContext = createContext<PlaygroundScoreContextValue | null>(null);

type PlaygroundScoreProviderProps = {
  isAuthenticated: boolean;
  serverScores: PlaygroundCloudScores;
  children: ReactNode;
};

export function PlaygroundScoreProvider({ isAuthenticated, serverScores, children }: PlaygroundScoreProviderProps) {
  const { cloudScores, persistTypeRacerBest, persistPromptRunBest, persistBreakoutBest } = usePlaygroundCloudSync({
    isAuthenticated,
    serverScores,
  });

  return (
    <PlaygroundScoreContext.Provider
      value={{ isAuthenticated, cloudScores, persistTypeRacerBest, persistPromptRunBest, persistBreakoutBest }}
    >
      {children}
    </PlaygroundScoreContext.Provider>
  );
}

export function usePlaygroundScoreContext(): PlaygroundScoreContextValue {
  const context = useContext(PlaygroundScoreContext);
  if (!context) {
    return {
      isAuthenticated: false,
      cloudScores: { typeRacer: {}, promptRun: null, breakout: {} },
      persistTypeRacerBest: () => undefined,
      persistPromptRunBest: () => undefined,
      persistBreakoutBest: () => undefined,
    };
  }

  return context;
}
