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

function statsFromCounts(correctChars: number, totalTyped: number, elapsedMs: number): TypeRacerStats {
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

  return statsFromCounts(correctChars, totalTyped, elapsedMs);
}

/**
 * Focus mode scores only characters the player typed (no free spaces between words).
 * Completed words count as fully correct; the in-progress word is scored positionally.
 */
export function computeFocusStats(
  words: string[],
  completedWordCount: number,
  currentWordInput: string,
  elapsedMs: number,
  matchOptions: MatchOptions,
): TypeRacerStats {
  let correctChars = 0;
  let totalTyped = 0;

  for (let i = 0; i < completedWordCount; i++) {
    const word = words[i] ?? "";
    correctChars += word.length;
    totalTyped += word.length;
  }

  const currentWord = words[completedWordCount] ?? "";
  for (let i = 0; i < currentWordInput.length; i++) {
    totalTyped += 1;
    if (charsMatch(currentWordInput[i], currentWord[i], matchOptions)) {
      correctChars += 1;
    }
  }

  return statsFromCounts(correctChars, totalTyped, elapsedMs);
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
