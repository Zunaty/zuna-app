"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  syncPlaygroundScoresFromLocal,
  upsertPromptRunBestRun,
  upsertTypeRacerBestScore,
} from "@/app/playground/actions";
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
    };

    void syncPlaygroundScoresFromLocal(local).then((result) => {
      hasSyncedRef.current = true;

      if (result.error) {
        const merged = mergePlaygroundCloudScores(local, serverScores);
        mergeBestScoresIntoLocal(merged.typeRacer);
        if (merged.promptRun) {
          mergeBestRunIntoLocal(merged.promptRun);
        }
        setCloudScores(merged);
        return;
      }

      mergeBestScoresIntoLocal(result.scores.typeRacer);
      if (result.scores.promptRun) {
        mergeBestRunIntoLocal(result.scores.promptRun);
      }
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

  return { cloudScores, persistTypeRacerBest, persistPromptRunBest };
}
