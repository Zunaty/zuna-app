import { ACHIEVEMENTS, isAchievementId } from "@/lib/achievements/definitions";

export const POINTS_PER_LEVEL = 50;

export function getTotalPoints(unlockedIds: string[]): number {
  return unlockedIds.reduce((sum, id) => (isAchievementId(id) ? sum + ACHIEVEMENTS[id].points : sum), 0);
}

export function getLevelForPoints(points: number): number {
  return Math.floor(Math.max(0, points) / POINTS_PER_LEVEL) + 1;
}

export type LevelProgress = {
  level: number;
  /** Points earned within the current level. */
  current: number;
  /** Points needed to advance one level. */
  required: number;
};

export function getLevelProgress(points: number): LevelProgress {
  const safePoints = Math.max(0, points);

  return {
    level: getLevelForPoints(safePoints),
    current: safePoints % POINTS_PER_LEVEL,
    required: POINTS_PER_LEVEL,
  };
}
