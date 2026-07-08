import { LEVEL_CLEAR_BONUS, LIVES_BONUS, VOLLEY_COMBO_BONUS } from "@/lib/breakout/constants";

/**
 * Points for a broken brick. `volleyIndex` is how many bricks were already
 * broken this volley (0 for the first) — each extra brick adds +10%.
 */
export function brickPoints(base: number, volleyIndex: number, scoreMult: number): number {
  return Math.round(base * (1 + VOLLEY_COMBO_BONUS * volleyIndex) * scoreMult);
}

export function levelClearBonus(level: number, scoreMult: number): number {
  return Math.round(LEVEL_CLEAR_BONUS * level * scoreMult);
}

export function livesBonus(lives: number): number {
  return LIVES_BONUS * lives;
}

export type BreakoutBestScore = {
  score: number;
  /** Levels cleared (classic caps at 5; roguelite is depth reached). */
  level: number;
  savedAt: string;
};

export function isBreakoutScoreBetter(candidate: BreakoutBestScore, current: BreakoutBestScore): boolean {
  if (candidate.score !== current.score) {
    return candidate.score > current.score;
  }

  return candidate.level > current.level;
}
