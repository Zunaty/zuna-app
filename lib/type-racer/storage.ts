import type { TypeRacerMode } from "@/lib/type-racer/constants";
import { roundAccuracy, roundWpm, type TypeRacerStats } from "@/lib/type-racer/scoring";

const STORAGE_KEY = "zuna-type-racer-best";

export type TypeRacerBestScore = {
  wpm: number;
  accuracy: number;
  savedAt: string;
};

export type TypeRacerBestScores = Partial<Record<TypeRacerMode, TypeRacerBestScore>>;

function readBestScores(): TypeRacerBestScores {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }

    return parsed as TypeRacerBestScores;
  } catch {
    return {};
  }
}

function writeBestScores(scores: TypeRacerBestScores): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

export function getBestScore(mode: TypeRacerMode): TypeRacerBestScore | null {
  return readBestScores()[mode] ?? null;
}

export function saveBestScoreIfBetter(mode: TypeRacerMode, stats: TypeRacerStats): boolean {
  const wpm = roundWpm(stats.wpm);
  const accuracy = roundAccuracy(stats.accuracy);
  const current = getBestScore(mode);

  if (current && wpm < current.wpm) {
    return false;
  }

  if (current && wpm === current.wpm && accuracy <= current.accuracy) {
    return false;
  }

  const next = readBestScores();
  next[mode] = {
    wpm,
    accuracy,
    savedAt: new Date().toISOString(),
  };
  writeBestScores(next);
  return true;
}
