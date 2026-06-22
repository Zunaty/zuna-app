import type { MatchOptions } from "@/lib/type-racer/matching";
import { charsMatch } from "@/lib/type-racer/matching";

export type TypeRacerStats = {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  totalTyped: number;
  elapsedMs: number;
};

export function computeStats(
  prompt: string,
  input: string,
  elapsedMs: number,
  matchOptions: MatchOptions,
): TypeRacerStats {
  const totalTyped = input.length;
  let correctChars = 0;

  for (let i = 0; i < totalTyped; i++) {
    if (charsMatch(input[i], prompt[i], matchOptions)) {
      correctChars++;
    }
  }

  const elapsedMin = elapsedMs / 60_000;
  const wpm = elapsedMin > 0 ? correctChars / 5 / elapsedMin : 0;
  const rawWpm = elapsedMin > 0 ? totalTyped / 5 / elapsedMin : 0;
  const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 100;

  return {
    wpm,
    rawWpm,
    accuracy,
    correctChars,
    totalTyped,
    elapsedMs,
  };
}

export function roundWpm(value: number): number {
  return Math.round(value);
}

export function roundAccuracy(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatElapsedSeconds(elapsedMs: number): string {
  return (elapsedMs / 1000).toFixed(1);
}
