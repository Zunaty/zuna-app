"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  syncPlaygroundScoresFromLocal,
  upsertBreakoutBestScore,
  upsertPromptRunBestRun,
  upsertTypeRacerBestScore,
} from "@/app/playground/actions";
import type { BreakoutMode } from "@/lib/breakout/constants";
import type { BreakoutBestScore } from "@/lib/breakout/scoring";
import {
  getAllBestScores as getBreakoutBestScores,
  mergeBestScoresIntoLocal as mergeBreakoutBestScoresIntoLocal,
} from "@/lib/breakout/storage";
import { mergePlaygroundCloudScores, type PlaygroundCloudScores } from "@/lib/playground/merge-scores";
import { getAllBestScores, mergeBestScoresIntoLocal } from "@/lib/type-racer/storage";
import { getBestRun, mergeBestRunIntoLocal, type PromptRunBestRun } from "@/lib/prompt-run/storage";
import type { TypeRacerMode } from "@/lib/type-racer/constants";
import type { TypeRacerBestScore } from "@/lib/type-racer/storage";

type UsePlaygroundCloudSyncOptions = {
  isAuthenticated: boolean;
  serverScores: PlaygroundCloudScores;
};

export function usePlaygroundCloudSync({ isAuthenticated, serverScores }: UsePlaygroundCloudSyncOptions) {
  const hasSyncedRef = useRef(false);
  const [cloudScores, setCloudScores] = useState<PlaygroundCloudScores>(serverScores);

  useEffect(() => {
    if (!isAuthenticated || hasSyncedRef.current) {
      return;
    }

    const local: PlaygroundCloudScores = {
      typeRacer: getAllBestScores(),
      promptRun: getBestRun(),
      breakout: getBreakoutBestScores(),
    };

    void syncPlaygroundScoresFromLocal(local).then((result) => {
      hasSyncedRef.current = true;

      if (result.error) {
        const merged = mergePlaygroundCloudScores(local, serverScores);
        mergeBestScoresIntoLocal(merged.typeRacer);
        if (merged.promptRun) {
          mergeBestRunIntoLocal(merged.promptRun);
        }
        mergeBreakoutBestScoresIntoLocal(merged.breakout);
        setCloudScores(merged);
        return;
      }

      mergeBestScoresIntoLocal(result.scores.typeRacer);
      if (result.scores.promptRun) {
        mergeBestRunIntoLocal(result.scores.promptRun);
      }
      mergeBreakoutBestScoresIntoLocal(result.scores.breakout);
      setCloudScores(result.scores);
    });
  }, [isAuthenticated, serverScores]);

  const persistTypeRacerBest = useCallback(
    (mode: TypeRacerMode, score: TypeRacerBestScore) => {
      if (!isAuthenticated) {
        return;
      }

      void upsertTypeRacerBestScore(mode, score).then((result) => {
        if (!result.error) {
          setCloudScores((current) => ({
            ...current,
            typeRacer: { ...current.typeRacer, [mode]: score },
          }));
        }
      });
    },
    [isAuthenticated],
  );

  const persistPromptRunBest = useCallback(
    (best: PromptRunBestRun) => {
      if (!isAuthenticated) {
        return;
      }

      void upsertPromptRunBestRun(best).then((result) => {
        if (!result.error) {
          setCloudScores((current) => ({ ...current, promptRun: best }));
        }
      });
    },
    [isAuthenticated],
  );

  const persistBreakoutBest = useCallback(
    (mode: BreakoutMode, score: BreakoutBestScore) => {
      if (!isAuthenticated) {
        return;
      }

      void upsertBreakoutBestScore(mode, score).then((result) => {
        if (!result.error) {
          setCloudScores((current) => ({
            ...current,
            breakout: { ...current.breakout, [mode]: score },
          }));
        }
      });
    },
    [isAuthenticated],
  );

  return { cloudScores, persistTypeRacerBest, persistPromptRunBest, persistBreakoutBest };
}
