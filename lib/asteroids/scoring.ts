import { LIVES_BONUS, ROCK_POINTS, STAR_POINTS, WAVE_CLEAR_BONUS } from "@/lib/asteroids/constants";
import type { RockSize } from "@/lib/asteroids/types";

export function rockPoints(size: RockSize, scoreMult: number): number {
  return Math.round(ROCK_POINTS[size] * scoreMult);
}

export function starPoints(scoreMult: number): number {
  return Math.round(STAR_POINTS * scoreMult);
}

export function waveClearBonus(wave: number, scoreMult: number): number {
  return Math.round(WAVE_CLEAR_BONUS * wave * scoreMult);
}

export function livesBonus(lives: number): number {
  return LIVES_BONUS * lives;
}
