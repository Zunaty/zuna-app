import {
  EPIC_ROUND_BONUS_POINTS,
  PERFECT_ROUND_BONUS_POINTS,
  SPEED_BONUS_POINTS,
  SPEED_BONUS_THRESHOLD,
  STREAK_MULTIPLIERS,
  STREAK_THRESHOLDS,
} from "@/lib/prompt-run/constants";
import type { PromptVariable, Rarity, Round, RoundCategory } from "@/lib/prompt-run/types";

export function isStreakRarity(rarity: Rarity): boolean {
  return rarity === "rare" || rarity === "epic" || rarity === "legendary";
}

export function getStreakMultiplier(streak: number): number | null {
  if (streak >= STREAK_THRESHOLDS.LEGENDARY) {
    return STREAK_MULTIPLIERS.LEGENDARY;
  }
  if (streak >= STREAK_THRESHOLDS.UNSTOPPABLE) {
    return STREAK_MULTIPLIERS.UNSTOPPABLE;
  }
  if (streak >= STREAK_THRESHOLDS.FIRE) {
    return STREAK_MULTIPLIERS.FIRE;
  }
  return null;
}

export function computePickScore(basePoints: number, streak: number): number {
  const multiplier = getStreakMultiplier(streak);
  const bonus = multiplier ? Math.round(basePoints * multiplier) : 0;
  return basePoints + bonus;
}

export function nextStreakAfterPick(rarity: Rarity, currentStreak: number): number {
  return isStreakRarity(rarity) ? currentStreak + 1 : 0;
}

export type RoundBonusBreakdown = {
  speedBonus: number;
  epicBonus: number;
  perfectBonus: number;
};

export function computeRoundBonuses(
  roundVariables: PromptVariable[],
  roundCategories: RoundCategory[],
  durationMs: number,
): RoundBonusBreakdown {
  const noSkips = roundCategories.every((category) => !category.skipped);
  const hasSelections = roundVariables.length > 0;

  const isPerfectRound =
    noSkips && hasSelections && roundVariables.every((variable) => variable.rarity === "legendary");

  const isEpicPlusRound =
    noSkips &&
    hasSelections &&
    roundVariables.every((variable) => variable.rarity === "epic" || variable.rarity === "legendary");

  const speedBonus = durationMs / 1000 < SPEED_BONUS_THRESHOLD ? SPEED_BONUS_POINTS : 0;
  const perfectBonus = isPerfectRound ? PERFECT_ROUND_BONUS_POINTS : 0;
  const epicBonus = isEpicPlusRound ? EPIC_ROUND_BONUS_POINTS : 0;

  return { speedBonus, epicBonus, perfectBonus };
}

export function finalizeRoundScore(
  round: Pick<Round, "roundScore" | "roundVariables" | "roundCategories">,
  durationMs: number,
): number {
  const bonuses = computeRoundBonuses(round.roundVariables, round.roundCategories, durationMs);
  return round.roundScore + bonuses.speedBonus + bonuses.epicBonus + bonuses.perfectBonus;
}

export function computeScrapBonus(roundScore: number): number {
  return Math.floor(roundScore / 3);
}

export function computeBonusRerolls(score: number, thresholds: number[]): number {
  let bonusRerolls = 0;

  thresholds.forEach((threshold, index) => {
    if (score >= threshold) {
      bonusRerolls = index + 1;
    }
  });

  return bonusRerolls;
}
