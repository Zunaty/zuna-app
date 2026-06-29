import { TYPE_RACER_MODE_LABEL, TYPE_RACER_MODES } from "@/lib/type-racer/constants";
import type { PromptRunBestRun } from "@/lib/prompt-run/storage";
import type { TypeRacerBestScores } from "@/lib/type-racer/storage";

export function formatTypeRacerHighlight(scores: TypeRacerBestScores): string | null {
  let bestWpm = -1;
  let bestMode: (typeof TYPE_RACER_MODES)[number] | null = null;

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

  const prefix = "Personal best";
  return `${prefix}: ${bestWpm} WPM · ${TYPE_RACER_MODE_LABEL[bestMode]}`;
}

export function formatPromptRunHighlight(best: PromptRunBestRun | null): string | null {
  if (!best) {
    return null;
  }

  const prefix = "Personal best";
  return `${prefix}: ${best.totalScore.toLocaleString()} pts · ${best.completedRounds} rounds`;
}
