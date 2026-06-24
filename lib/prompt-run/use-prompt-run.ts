"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { playRaritySound } from "@/lib/prompt-run/audio";
import { assemblePrompt } from "@/lib/prompt-run/assemble-prompt";
import { migratePromptRunState } from "@/lib/prompt-run/migrate-state";
import {
  BONUS_REROLL_BASE_POINTS,
  FIRST_BONUS_RATIO,
  MAX_REROLL_CHARGES,
  MAX_ROUNDS,
  RARITY_BOOST_DURATION_ROUNDS,
  REQUIRED_SELECTIONS,
  SHOP_ITEM_COOLDOWN_ROUNDS,
  SHOP_REFRESH_BASE_COST,
  SHOP_UNLOCK_ROUND,
  VOLUME_MAX,
  VOLUME_MIN,
  VOLUME_STEP,
} from "@/lib/prompt-run/constants";
import { promptRunReducer } from "@/lib/prompt-run/reducer";
import { createCategoryOptions, createId, createRound } from "@/lib/prompt-run/round";
import { computePickScore, getStreakMultiplier, nextStreakAfterPick } from "@/lib/prompt-run/scoring";
import {
  generateShopItems,
  getRerollChargeAmount,
  isBuffActiveForRound,
  prepareShopItemsForRound,
} from "@/lib/prompt-run/shop";
import {
  clearActiveRun,
  createFreshModelState,
  getActiveRun,
  getPromptRunSettings,
  saveActiveRun,
  saveBestRunIfBetter,
  savePromptRunSettings,
  type PromptRunSettings,
} from "@/lib/prompt-run/storage";
import type {
  Buff,
  GeneratedImage,
  PickFeedback,
  PromptVariable,
  Round,
  ShopEvent,
  ShopItem,
} from "@/lib/prompt-run/types";

function createInitialState() {
  return createFreshModelState();
}

function expireBuffs(buffs: Buff[], completedRounds: number): Buff[] {
  return buffs.map((buff) => {
    const endRound = buff.roundStart + buff.duration - 1;
    if (buff.active && endRound < completedRounds) {
      return { ...buff, active: false };
    }
    return buff;
  });
}

export function usePromptRun() {
  const [model, dispatch] = useReducer(promptRunReducer, undefined, createInitialState);
  const { game, round } = model;
  const [settings, setSettings] = useState<PromptRunSettings>(() => getPromptRunSettings());
  const [categorySequence] = useState<readonly string[]>(() => getPromptRunSettings().categorySequence);
  const [pickFeedback, setPickFeedback] = useState<PickFeedback | null>(null);
  const skipInitialPersistence = useRef(true);

  useEffect(() => {
    const saved = getActiveRun();
    if (saved) {
      dispatch({ type: "RESTORE", state: migratePromptRunState(saved) });
    }
  }, []);

  useEffect(() => {
    if (!pickFeedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPickFeedback(null);
    }, 700);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [pickFeedback]);

  useEffect(() => {
    if (skipInitialPersistence.current) {
      skipInitialPersistence.current = false;
      return;
    }

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

  const resolveShopForRound = useCallback(
    (roundNumber: number) => {
      const willUnlockShop = roundNumber >= SHOP_UNLOCK_ROUND;
      if (!willUnlockShop) {
        return { willUnlockShop, nextShopItems: game.shop.items };
      }
      return {
        willUnlockShop,
        nextShopItems: prepareShopItemsForRound(game.shop.items, game.completedRounds, categorySequence, Math.random),
      };
    },
    [categorySequence, game.completedRounds, game.shop.items],
  );

  const endRound = useCallback(
    (finalRound: Round, streakUpdate: { streak: number; streakRecord: number }) => {
      const endTime = Date.now();
      const duration = endTime - finalRound.roundStartTime;
      const nextCompletedRounds = game.completedRounds + 1;

      dispatch({
        type: "ROUND_END",
        completedRound: {
          ...finalRound,
          roundEndTime: endTime,
          roundDuration: duration,
          currentCategory: null,
        },
        durationMs: duration,
        streakUpdate,
      });
      dispatch({
        type: "GAME_UPDATE",
        game: { buffs: expireBuffs(game.buffs, nextCompletedRounds) },
      });
    },
    [game.buffs, game.completedRounds],
  );

  const startRound = useCallback(() => {
    if (game.phase === "round" || game.completedRounds >= MAX_ROUNDS) {
      return;
    }

    const roundNumber = game.completedRounds + 1;
    const rarityBoost = isBuffActiveForRound(game.buffs, "rarity_boost", roundNumber);
    const newRound = createRound({
      roundNumber,
      categorySequence,
      random: Math.random,
      rarityBoost,
    });
    const { willUnlockShop, nextShopItems } = resolveShopForRound(roundNumber);

    dispatch({
      type: "ROUND_START",
      newRound,
      willUnlockShop,
      nextShopItems,
    });
  }, [categorySequence, game.buffs, game.completedRounds, game.phase, resolveShopForRound]);

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

      playRaritySound(selected.rarity, settings);

      const appliedMultiplier = getStreakMultiplier(game.streak);
      const pickScore = computePickScore(selected.points, game.streak);
      setPickFeedback({ id: createId(), points: pickScore, rarity: selected.rarity });
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
    [endRound, game.phase, game.streak, game.streakRecord, rerollChargeThresholds, round, settings],
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

    const rarityBoost = isBuffActiveForRound(game.buffs, "rarity_boost", round.roundNumber);
    const newOptions = createCategoryOptions(round.currentCategory.name, Math.random, { rarityBoost });
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
  }, [game.buffs, game.phase, game.rerollCharges, round]);

  const canAffordItem = useCallback((item: ShopItem) => game.totalScore >= item.price, [game.totalScore]);

  const canRefreshShop = useCallback(() => {
    const hasAvailable = game.shop.items.some((item) => !item.isOnCooldown);
    return hasAvailable && game.totalScore >= SHOP_REFRESH_BASE_COST;
  }, [game.shop.items, game.totalScore]);

  const purchaseShopItem = useCallback(
    (item: ShopItem) => {
      if (!round || game.phase !== "round" || item.isOnCooldown || !canAffordItem(item)) {
        return;
      }

      const purchaseEvent: ShopEvent = {
        id: createId(),
        action: "purchase",
        timestamp: Date.now(),
        price: item.price,
        itemName: item.type === "variable" ? item.variable?.name : item.name,
        itemRarity: item.type === "variable" ? item.variable?.rarity : item.rarity,
        itemType: item.type,
      };

      if (item.type === "variable" && item.variable) {
        const purchased: PromptVariable = {
          ...item.variable,
          categoryName: "shop",
        };
        const updatedRound: Round = {
          ...round,
          shopVariables: [...round.shopVariables, purchased],
          shopSpent: (round.shopSpent ?? 0) + item.price,
          shopEvents: [...(round.shopEvents ?? []), purchaseEvent],
        };
        const updatedItems = game.shop.items.map((shopItem) =>
          shopItem.id === item.id
            ? {
                ...shopItem,
                isOnCooldown: true,
                cooldownEndRound: game.completedRounds + SHOP_ITEM_COOLDOWN_ROUNDS,
              }
            : shopItem,
        );

        dispatch({ type: "ROUND_UPDATE", round: updatedRound });
        dispatch({ type: "TOTAL_SCORE_ADJUST", delta: -item.price });
        dispatch({ type: "SHOP_SET_ITEMS", items: updatedItems });
        dispatch({ type: "GAME_UPDATE", game: { shopItemsUsed: game.shopItemsUsed + 1 } });
        return;
      }

      if (item.type === "buff") {
        let gameUpdate: Partial<typeof game> = { shopItemsUsed: game.shopItemsUsed + 1 };
        const nextBuffs = [...game.buffs];

        if (item.name.startsWith("Reroll Charge")) {
          const amount = getRerollChargeAmount(item.name);
          gameUpdate = {
            ...gameUpdate,
            rerollCharges: Math.min(game.rerollCharges + amount, MAX_REROLL_CHARGES),
          };
          nextBuffs.push({
            id: createId(),
            type: "buff",
            active: false,
            name: "reroll_charge",
            description: `Gained ${amount} reroll charge${amount > 1 ? "s" : ""}`,
            roundStart: game.completedRounds + 1,
            duration: 0,
          });
        } else if (item.name === "Rarity Boost") {
          nextBuffs.push({
            id: createId(),
            type: "buff",
            active: true,
            name: "rarity_boost",
            description: "Increased chance of rare or better category options",
            roundStart: game.completedRounds + 1,
            duration: RARITY_BOOST_DURATION_ROUNDS,
          });
        }

        gameUpdate = { ...gameUpdate, buffs: nextBuffs };

        const updatedRound: Round = {
          ...round,
          shopSpent: (round.shopSpent ?? 0) + item.price,
          shopEvents: [...(round.shopEvents ?? []), purchaseEvent],
        };
        const updatedItems = game.shop.items.map((shopItem) =>
          shopItem.id === item.id
            ? {
                ...shopItem,
                isOnCooldown: true,
                cooldownEndRound: game.completedRounds + SHOP_ITEM_COOLDOWN_ROUNDS,
              }
            : shopItem,
        );

        dispatch({ type: "ROUND_UPDATE", round: updatedRound });
        dispatch({ type: "TOTAL_SCORE_ADJUST", delta: -item.price });
        dispatch({ type: "SHOP_SET_ITEMS", items: updatedItems });
        dispatch({ type: "GAME_UPDATE", game: gameUpdate });
      }
    },
    [canAffordItem, game, round],
  );

  const refreshShop = useCallback(() => {
    if (!game.shopUnlocked || !round || !canRefreshShop()) {
      return;
    }

    const refreshEvent: ShopEvent = {
      id: createId(),
      action: "refresh",
      timestamp: Date.now(),
      price: SHOP_REFRESH_BASE_COST,
    };

    const updatedRound: Round = {
      ...round,
      shopSpent: (round.shopSpent ?? 0) + SHOP_REFRESH_BASE_COST,
      shopEvents: [...(round.shopEvents ?? []), refreshEvent],
    };

    const numToReplace = game.shop.items.filter((item) => !item.isOnCooldown).length;
    let replacementPool = generateShopItems(categorySequence, Math.random);
    if (numToReplace > replacementPool.length) {
      replacementPool = [...replacementPool, ...generateShopItems(categorySequence, Math.random)];
    }

    let replacementIndex = 0;
    const updatedItems = game.shop.items.map((item) => {
      if (item.isOnCooldown) {
        return item;
      }
      const replacement = replacementPool[replacementIndex] ?? item;
      replacementIndex += 1;
      return { ...replacement, isOnCooldown: false, cooldownEndRound: null };
    });

    dispatch({ type: "ROUND_UPDATE", round: updatedRound });
    dispatch({ type: "TOTAL_SCORE_ADJUST", delta: -SHOP_REFRESH_BASE_COST });
    dispatch({ type: "SHOP_SET_ITEMS", items: updatedItems });
  }, [canRefreshShop, categorySequence, game.shop.items, game.shopUnlocked, round]);

  const continueToOverview = useCallback(() => {
    dispatch({ type: "PHASE_SET", phase: "overview" });
  }, []);

  const scrapRound = useCallback(() => {
    dispatch({ type: "SCRAP_ROUND" });
  }, []);

  const failGeneration = useCallback((message?: string) => {
    dispatch({ type: "GENERATION_FAILED", message });
  }, []);

  const setGeneratedImage = useCallback((image: GeneratedImage) => {
    dispatch({ type: "SET_GENERATED_IMAGE", image });
  }, []);

  const resetRun = useCallback(() => {
    clearActiveRun();
    dispatch({ type: "GAME_RESET" });
  }, []);

  const toggleMute = useCallback(() => {
    setSettings((current) => {
      const next = { ...current, isMuted: !current.isMuted };
      savePromptRunSettings(next);
      return next;
    });
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    setSettings((current) => {
      const volume = Math.round(Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, current.volume + delta)) * 10) / 10;
      const next = {
        ...current,
        volume,
        isMuted: delta > 0 && volume > 0 ? false : current.isMuted,
      };
      savePromptRunSettings(next);
      return next;
    });
  }, []);

  const decreaseVolume = useCallback(() => {
    adjustVolume(-VOLUME_STEP);
  }, [adjustVolume]);

  const increaseVolume = useCallback(() => {
    adjustVolume(VOLUME_STEP);
  }, [adjustVolume]);

  const dismissOnboarding = useCallback(() => {
    setSettings((current) => {
      if (current.hasSeenOnboarding) {
        return current;
      }
      const next = { ...current, hasSeenOnboarding: true };
      savePromptRunSettings(next);
      return next;
    });
  }, []);

  const lastRound = game.rounds[game.rounds.length - 1];
  const canScrap =
    game.phase === "generate" && !lastRound?.scrapped && !lastRound?.generatedImage && !lastRound?.generationFailed;

  return {
    game,
    round,
    assembledPrompt,
    categorySequence,
    settings,
    pickFeedback,
    startRun,
    startRound,
    selectVariable,
    skipCategory,
    rerollCategory,
    purchaseShopItem,
    refreshShop,
    canAffordItem,
    canRefreshShop,
    continueToOverview,
    scrapRound,
    failGeneration,
    canScrap,
    setGeneratedImage,
    resetRun,
    toggleMute,
    decreaseVolume,
    increaseVolume,
    dismissOnboarding,
  };
}
