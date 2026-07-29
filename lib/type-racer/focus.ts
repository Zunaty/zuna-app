import { charsMatch, type MatchOptions } from "@/lib/type-racer/matching";

export type FocusInputResult = {
  wordIndex: number;
  currentWordInput: string;
  /** Rejected by strict mode — keep previous buffer. */
  rejected: boolean;
  /** Advanced to the next word after a correct complete match. */
  advanced: boolean;
  /** Completed every word in the prompt. */
  finished: boolean;
};

function wordsEqual(typed: string, expected: string, options: MatchOptions): boolean {
  if (typed.length !== expected.length) {
    return false;
  }

  for (let i = 0; i < typed.length; i++) {
    if (!charsMatch(typed[i], expected[i], options)) {
      return false;
    }
  }

  return true;
}

function isStrictWordInputValid(
  expectedWord: string,
  previousInput: string,
  nextInput: string,
  options: MatchOptions,
): boolean {
  if (nextInput.length < previousInput.length) {
    return true;
  }

  for (let i = 0; i < nextInput.length; i++) {
    if (!charsMatch(nextInput[i], expectedWord[i], options)) {
      return false;
    }
  }

  return true;
}

/** Normalize textarea value for focus mode — spaces/newlines never advance. */
export function normalizeFocusRawInput(value: string): string {
  return value.replace(/\s/g, "");
}

/**
 * Apply a focus-mode keystroke buffer update.
 * Advances only when the current word is typed correctly in full (no space required).
 */
export function applyFocusInput(args: {
  words: string[];
  wordIndex: number;
  currentWordInput: string;
  nextRaw: string;
  strictMode: boolean;
  matchOptions: MatchOptions;
}): FocusInputResult {
  const { words, wordIndex, currentWordInput, strictMode, matchOptions } = args;
  const currentWord = words[wordIndex] ?? "";
  const nextInput = normalizeFocusRawInput(args.nextRaw);

  if (wordIndex >= words.length) {
    return {
      wordIndex,
      currentWordInput: "",
      rejected: false,
      advanced: false,
      finished: true,
    };
  }

  if (strictMode && !isStrictWordInputValid(currentWord, currentWordInput, nextInput, matchOptions)) {
    return {
      wordIndex,
      currentWordInput,
      rejected: true,
      advanced: false,
      finished: false,
    };
  }

  if (wordsEqual(nextInput, currentWord, matchOptions)) {
    const nextIndex = wordIndex + 1;
    return {
      wordIndex: nextIndex,
      currentWordInput: "",
      rejected: false,
      advanced: true,
      finished: nextIndex >= words.length,
    };
  }

  return {
    wordIndex,
    currentWordInput: nextInput,
    rejected: false,
    advanced: false,
    finished: false,
  };
}

export function splitPromptWords(prompt: string): string[] {
  return prompt.split(" ").filter((word) => word.length > 0);
}
