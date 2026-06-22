import { POINT_RANGES, RARITY_PROBABILITIES } from "@/lib/prompt-run/constants";
import type { PromptVariable, Rarity } from "@/lib/prompt-run/types";

export function rollRarity(randomUnit: number): Rarity {
  const unit = Math.min(Math.max(randomUnit, 0), 1 - Number.EPSILON);

  if (unit < RARITY_PROBABILITIES.legendary) {
    return "legendary";
  }
  if (unit < RARITY_PROBABILITIES.legendary + RARITY_PROBABILITIES.epic) {
    return "epic";
  }
  if (unit < RARITY_PROBABILITIES.legendary + RARITY_PROBABILITIES.epic + RARITY_PROBABILITIES.rare) {
    return "rare";
  }
  if (
    unit <
    RARITY_PROBABILITIES.legendary +
      RARITY_PROBABILITIES.epic +
      RARITY_PROBABILITIES.rare +
      RARITY_PROBABILITIES.uncommon
  ) {
    return "uncommon";
  }
  return "common";
}

export function rollPointsForRarity(rarity: Rarity, randomUnit: number): number {
  const range = POINT_RANGES[rarity];
  const span = range.max - range.min + 1;
  const offset = Math.floor(randomUnit * span);
  return range.min + offset;
}

export function createPromptVariable(
  id: string,
  name: string,
  rarityRandom: number,
  pointsRandom: number,
): PromptVariable {
  const rarity = rollRarity(rarityRandom);
  return {
    id,
    name,
    rarity,
    points: rollPointsForRarity(rarity, pointsRandom),
    streakMultiplier: null,
  };
}
