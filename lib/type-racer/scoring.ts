export type TypeRacerStats = {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  totalTyped: number;
  elapsedMs: number;
};

export function computeStats(prompt: string, input: string, elapsedMs: number): TypeRacerStats {
  const totalTyped = input.length;
  let correctChars = 0;

  for (let i = 0; i < totalTyped; i++) {
    if (input[i] === prompt[i]) {
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
