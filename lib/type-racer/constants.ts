export type TypeRacerMode = "words-30" | "words-60" | "focus-30" | "focus-60" | "sentence" | "paragraph";

export type TypeRacerPromptKind = "words" | "focus" | "sentence" | "paragraph";

export const TYPE_RACER_MODES: TypeRacerMode[] = [
  "words-30",
  "words-60",
  "focus-30",
  "focus-60",
  "sentence",
  "paragraph",
];

export const TYPE_RACER_PROMPT_KINDS: TypeRacerPromptKind[] = ["words", "focus", "sentence", "paragraph"];

export const TYPE_RACER_PROMPT_KIND_LABEL: Record<TypeRacerPromptKind, string> = {
  words: "Random words",
  focus: "Word focus",
  sentence: "Sentence",
  paragraph: "Paragraph",
};

export const TYPE_RACER_WORDS_DURATIONS = [30, 60] as const;

export type TypeRacerWordsDuration = (typeof TYPE_RACER_WORDS_DURATIONS)[number];

export const TYPE_RACER_MODE_LABEL: Record<TypeRacerMode, string> = {
  "words-30": "Random words · 30s",
  "words-60": "Random words · 60s",
  "focus-30": "Word focus · 30s",
  "focus-60": "Word focus · 60s",
  sentence: "Sentence",
  paragraph: "Paragraph",
};

export const TYPE_RACER_COUNTDOWN_START = 3;

export const TYPE_RACER_WORD_COUNT = 80;

export const TYPE_RACER_PARAGRAPH_DURATION_MS = 120_000;

export function isFocusMode(mode: TypeRacerMode): boolean {
  return mode === "focus-30" || mode === "focus-60";
}

export function isTimedWordsMode(mode: TypeRacerMode): boolean {
  return mode === "words-30" || mode === "words-60" || isFocusMode(mode);
}

export function getPromptKind(mode: TypeRacerMode): TypeRacerPromptKind {
  if (mode === "sentence" || mode === "paragraph") {
    return mode;
  }

  if (isFocusMode(mode)) {
    return "focus";
  }

  return "words";
}

/** Duration for timed words / focus modes; defaults to 60s for untimed modes. */
export function getWordsDuration(mode: TypeRacerMode): TypeRacerWordsDuration {
  if (mode === "words-30" || mode === "focus-30") {
    return 30;
  }

  return 60;
}

export function toWordsMode(duration: TypeRacerWordsDuration): TypeRacerMode {
  return duration === 30 ? "words-30" : "words-60";
}

export function toFocusMode(duration: TypeRacerWordsDuration): TypeRacerMode {
  return duration === 30 ? "focus-30" : "focus-60";
}

export function getModeDurationMs(mode: TypeRacerMode): number | null {
  switch (mode) {
    case "words-30":
    case "focus-30":
      return 30_000;
    case "words-60":
    case "focus-60":
      return 60_000;
    case "sentence":
      return null;
    case "paragraph":
      return TYPE_RACER_PARAGRAPH_DURATION_MS;
  }
}

export function isCountdownMode(mode: TypeRacerMode): boolean {
  return getModeDurationMs(mode) !== null;
}

export function isCaseSensitiveMode(mode: TypeRacerMode): boolean {
  return mode === "sentence" || mode === "paragraph";
}
