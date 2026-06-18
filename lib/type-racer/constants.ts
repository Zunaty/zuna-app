export type TypeRacerMode = "words-30" | "words-60";

export const TYPE_RACER_MODES: TypeRacerMode[] = ["words-30", "words-60"];

export const TYPE_RACER_MODE_LABEL: Record<TypeRacerMode, string> = {
  "words-30": "30 seconds",
  "words-60": "60 seconds",
};

export const TYPE_RACER_MODE_DURATION_MS: Record<TypeRacerMode, number> = {
  "words-30": 30_000,
  "words-60": 60_000,
};

export const TYPE_RACER_COUNTDOWN_START = 3;

export const TYPE_RACER_WORD_COUNT = 80;
