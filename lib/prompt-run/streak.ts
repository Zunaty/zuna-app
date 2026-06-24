import { STREAK_MULTIPLIERS, STREAK_THRESHOLDS } from "@/lib/prompt-run/constants";

export type StreakTier = "none" | "fire" | "unstoppable" | "legendary";

export function getStreakTier(streak: number): StreakTier {
  if (streak >= STREAK_THRESHOLDS.LEGENDARY) {
    return "legendary";
  }
  if (streak >= STREAK_THRESHOLDS.UNSTOPPABLE) {
    return "unstoppable";
  }
  if (streak >= STREAK_THRESHOLDS.FIRE) {
    return "fire";
  }
  return "none";
}

const STREAK_TIER_LABEL: Record<Exclude<StreakTier, "none">, string> = {
  fire: "On Fire",
  unstoppable: "Unstoppable",
  legendary: "Legendary",
};

const STREAK_TIER_MULTIPLIER: Record<Exclude<StreakTier, "none">, number> = {
  fire: STREAK_MULTIPLIERS.FIRE,
  unstoppable: STREAK_MULTIPLIERS.UNSTOPPABLE,
  legendary: STREAK_MULTIPLIERS.LEGENDARY,
};

export function getStreakTierLabel(tier: StreakTier): string | null {
  if (tier === "none") {
    return null;
  }
  return STREAK_TIER_LABEL[tier];
}

export function getStreakTierMultiplierLabel(tier: StreakTier): string | null {
  if (tier === "none") {
    return null;
  }
  const multiplier = STREAK_TIER_MULTIPLIER[tier];
  return `+${Math.round(multiplier * 100)}%`;
}
