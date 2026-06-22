"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

import { assemblePrompt } from "@/lib/prompt-run/assemble-prompt";
import {
  BONUS_REROLL_BASE_POINTS,
  FIRST_BONUS_RATIO,
  MAX_ROUNDS,
  REQUIRED_SELECTIONS,
  SHOP_UNLOCK_ROUND,
} from "@/lib/prompt-run/constants";
import { promptRunReducer } from "@/lib/prompt-run/reducer";
import { createCategoryOptions, createRound } from "@/lib/prompt-run/round";
import {
  computePickScore,
  finalizeRoundScore,
  getStreakMultiplier,
  nextStreakAfterPick,
} from "@/lib/prompt-run/scoring";
import {
  clearActiveRun,
  createFreshModelState,
  getActiveRun,
  getPromptRunSettings,
  saveActiveRun,
  saveBestRunIfBetter,
} from "@/lib/prompt-run/storage";
import type { PromptVariable, Round } from "@/lib/prompt-run/types";

function createInitialState() {
  return getActiveRun() ?? createFreshModelState();
}

export function usePromptRun() {
  const [model, dispatch] = useReducer(promptRunReducer, undefined, createInitialState);
  const { game, round } = model;
  const [categorySequence] = useState<readonly string[]>(() => getPromptRunSettings().categorySequence);

  useEffect(() => {
    if (game.phase === "fresh") {
      clearActiveRun();
      return;
    }

    if (game.completedRounds >= MAX_ROUNDS && game.phase === "overview") {
      saveBestRunIfBetter(game.totalScore, game.completedRounds);
      clearActiveRun();
      return;
    }

    saveActiveRun(model);
  }, [game.completedRounds, game.phase, game.totalScore, model]);

  const rerollChargeThresholds = useMemo(() => {
    const secondBonusCharge = categorySequence.length * BONUS_REROLL_BASE_POINTS;
    const firstBonusCharge = secondBonusCharge / FIRST_BONUS_RATIO;
    return [firstBonusCharge, secondBonusCharge];
  }, [categorySequence]);

  const assembledPrompt = useMemo(() => {
    if (game.phase !== "generate" && game.phase !== "overview") {
      return "";
    }
    const lastRound = game.rounds[game.rounds.length - 1];
    if (!lastRound) {
      return "";
    }
    return assemblePrompt(lastRound.roundVariables, lastRound.shopVariables);
  }, [game.phase, game.rounds]);

  const endRound = useCallback((finalRound: Round, streakUpdate: { streak: number; streakRecord: number }) => {
    const endTime = Date.now();
    const duration = endTime - finalRound.roundStartTime;
    const finalScore = finalizeRoundScore(finalRound, duration);

    dispatch({
      type: "ROUND_END",
      completedRound: {
        ...finalRound,
        roundEndTime: endTime,
        roundDuration: duration,
        currentCategory: null,
        roundScore: finalScore,
      },
      durationMs: duration,
      streakUpdate,
    });
  }, []);

  const startRound = useCallback(() => {
    if (game.phase === "round" || game.completedRounds >= MAX_ROUNDS) {
      return;
    }

    const newRound = createRound({
      roundNumber: game.completedRounds + 1,
      categorySequence,
      random: Math.random,
    });

    dispatch({
      type: "ROUND_START",
      newRound,
      willUnlockShop: newRound.roundNumber >= SHOP_UNLOCK_ROUND,
      nextShopItems: game.shop.items,
    });
  }, [categorySequence, game.completedRounds, game.phase, game.shop.items]);

  const startRun = useCallback(() => {
    const newRound = createRound({
      roundNumber: 1,
      categorySequence,
      random: Math.random,
    });

    dispatch({
      type: "RUN_START",
      newRound,
      willUnlockShop: false,
      nextShopItems: [],
    });
  }, [categorySequence]);

  const selectVariable = useCallback(
    (selected: PromptVariable) => {
      if (!round || game.phase !== "round") {
        return;
      }

      const appliedMultiplier = getStreakMultiplier(game.streak);
      const pickScore = computePickScore(selected.points, game.streak);
      const newRoundScore = round.roundScore + pickScore;
      const newStreak = nextStreakAfterPick(selected.rarity, game.streak);
      const newStreakRecord = Math.max(game.streakRecord, game.streak);

      let newBonusRerolls = round.roundBonusRerolls;
      rerollChargeThresholds.forEach((threshold, index) => {
        if (round.roundScore < threshold && newRoundScore >= threshold && newBonusRerolls <= index) {
          newBonusRerolls = index + 1;
        }
      });

      const currentCategory = round.currentCategory;
      const currentCategoryIndex = round.roundCategories.findIndex((category) => category.id === currentCategory?.id);
      const nextCategory = round.roundCategories[currentCategoryIndex + 1] ?? null;
      const isLastCategory = currentCategoryIndex === round.roundCategories.length - 1;

      const pickedVariable: PromptVariable = {
        ...selected,
        streakMultiplier: appliedMultiplier,
        categoryName: currentCategory?.name,
      };

      const updatedRound: Round = {
        ...round,
        roundScore: newRoundScore,
        roundVariables: [...round.roundVariables, pickedVariable],
        roundBonusRerolls: newBonusRerolls,
        currentCategory: nextCategory,
      };

      const streakUpdate = {
        streak: newStreak,
        streakRecord: Math.max(newStreakRecord, newStreak),
      };

      if (isLastCategory) {
        endRound(updatedRound, streakUpdate);
        return;
      }

      dispatch({ type: "ROUND_UPDATE", round: updatedRound });
      dispatch({ type: "SET_STREAK", ...streakUpdate });
    },
    [endRound, game.phase, game.streak, game.streakRecord, rerollChargeThresholds, round],
  );

  const skipCategory = useCallback(() => {
    if (!round || game.phase !== "round" || !round.currentCategory) {
      return;
    }

    const remainingUnskipped = round.roundCategories.filter((category) => !category.skipped).length;
    if (remainingUnskipped <= REQUIRED_SELECTIONS) {
      return;
    }

    const currentCategoryIndex = round.roundCategories.findIndex(
      (category) => category.id === round.currentCategory?.id,
    );
    const updatedCategories = round.roundCategories.map((category, index) =>
      index === currentCategoryIndex ? { ...category, skipped: true } : category,
    );
    const nextCategory = updatedCategories[currentCategoryIndex + 1] ?? null;
    const updatedRound: Round = {
      ...round,
      roundCategories: updatedCategories,
      currentCategory: nextCategory,
    };

    if (currentCategoryIndex === round.roundCategories.length - 1) {
      endRound(updatedRound, { streak: game.streak, streakRecord: game.streakRecord });
      return;
    }

    dispatch({ type: "ROUND_UPDATE", round: updatedRound });
  }, [endRound, game.phase, game.streak, game.streakRecord, round]);

  const rerollCategory = useCallback(() => {
    if (!round || game.phase !== "round" || game.rerollCharges <= 0 || !round.currentCategory) {
      return;
    }

    dispatch({ type: "REROLL_CONSUME" });

    const newOptions = createCategoryOptions(round.currentCategory.name, Math.random);
    const updatedCategories = round.roundCategories.map((category) =>
      category.id === round.currentCategory?.id ? { ...category, availableOptions: newOptions } : category,
    );

    dispatch({
      type: "ROUND_UPDATE",
      round: {
        ...round,
        roundCategories: updatedCategories,
        currentCategory: { ...round.currentCategory, availableOptions: newOptions },
      },
    });
  }, [game.phase, game.rerollCharges, round]);

  const continueToOverview = useCallback(() => {
    dispatch({ type: "PHASE_SET", phase: "overview" });
  }, []);

  const resetRun = useCallback(() => {
    clearActiveRun();
    dispatch({ type: "GAME_RESET" });
  }, []);

  return {
    game,
    round,
    assembledPrompt,
    categorySequence,
    startRun,
    startRound,
    selectVariable,
    skipCategory,
    rerollCategory,
    continueToOverview,
    resetRun,
  };
}
