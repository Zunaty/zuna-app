import { TYPE_RACER_MODE_LABEL, TYPE_RACER_MODES, type TypeRacerMode } from "@/lib/type-racer/constants";
import type { TypeRacerStats } from "@/lib/type-racer/scoring";
import { roundAccuracy, roundWpm } from "@/lib/type-racer/scoring";

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

export function getBestScoreHighlight(): string | null {
  const scores = readBestScores();
  let bestWpm = -1;
  let bestMode: TypeRacerMode | null = null;

  for (const mode of TYPE_RACER_MODES) {
    const score = scores[mode];
    if (score && score.wpm > bestWpm) {
      bestWpm = score.wpm;
      bestMode = mode;
    }
  }

  if (!bestMode || bestWpm < 0) {
    return null;
  }

  return `Personal best: ${bestWpm} WPM · ${TYPE_RACER_MODE_LABEL[bestMode]}`;
}
