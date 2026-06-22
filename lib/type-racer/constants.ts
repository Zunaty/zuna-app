export type TypeRacerMode = "words-30" | "words-60" | "sentence" | "paragraph";

export type TypeRacerPromptKind = "words" | "sentence" | "paragraph";

export const TYPE_RACER_MODES: TypeRacerMode[] = ["words-30", "words-60", "sentence", "paragraph"];

export const TYPE_RACER_PROMPT_KINDS: TypeRacerPromptKind[] = ["words", "sentence", "paragraph"];

export const TYPE_RACER_PROMPT_KIND_LABEL: Record<TypeRacerPromptKind, string> = {
  words: "Random words",
  sentence: "Sentence",
  paragraph: "Paragraph",
};

export const TYPE_RACER_WORDS_DURATIONS = [30, 60] as const;

export type TypeRacerWordsDuration = (typeof TYPE_RACER_WORDS_DURATIONS)[number];

export const TYPE_RACER_MODE_LABEL: Record<TypeRacerMode, string> = {
  "words-30": "Random words · 30s",
  "words-60": "Random words · 60s",
  sentence: "Sentence",
  paragraph: "Paragraph",
};

export const TYPE_RACER_COUNTDOWN_START = 3;

export const TYPE_RACER_WORD_COUNT = 80;

export const TYPE_RACER_PARAGRAPH_DURATION_MS = 120_000;

export function getPromptKind(mode: TypeRacerMode): TypeRacerPromptKind {
  if (mode === "sentence" || mode === "paragraph") {
    return mode;
  }

  return "words";
}

export function getWordsDuration(mode: TypeRacerMode): TypeRacerWordsDuration {
  return mode === "words-30" ? 30 : 60;
}

export function toWordsMode(duration: TypeRacerWordsDuration): TypeRacerMode {
  return duration === 30 ? "words-30" : "words-60";
}

export function getModeDurationMs(mode: TypeRacerMode): number | null {
  switch (mode) {
    case "words-30":
      return 30_000;
    case "words-60":
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
