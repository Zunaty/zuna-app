import { isCaseSensitiveMode, type TypeRacerMode } from "@/lib/type-racer/constants";

export type MatchOptions = {
  caseSensitive: boolean;
};

export function getMatchOptions(mode: TypeRacerMode): MatchOptions {
  return { caseSensitive: isCaseSensitiveMode(mode) };
}

export function charsMatch(typed: string | undefined, expected: string | undefined, options: MatchOptions): boolean {
  if (typed === undefined || expected === undefined) {
    return false;
  }

  if (options.caseSensitive) {
    return typed === expected;
  }

  return typed.toLowerCase() === expected.toLowerCase();
}

export function promptsEqual(prompt: string, input: string, options: MatchOptions): boolean {
  if (input.length !== prompt.length) {
    return false;
  }

  for (let i = 0; i < prompt.length; i++) {
    if (!charsMatch(input[i], prompt[i], options)) {
      return false;
    }
  }

  return true;
}

export function isStrictInputValid(
  prompt: string,
  previousInput: string,
  nextInput: string,
  options: MatchOptions,
): boolean {
  if (nextInput.length < previousInput.length) {
    return true;
  }

  for (let i = 0; i < nextInput.length; i++) {
    if (!charsMatch(nextInput[i], prompt[i], options)) {
      return false;
    }
  }

  return true;
}
