import { describe, expect, it } from "vitest";

import { applyFocusInput, normalizeFocusRawInput } from "@/lib/type-racer/focus";
import { computeFocusStats, roundAccuracy, roundWpm } from "@/lib/type-racer/scoring";

const caseInsensitive = { caseSensitive: false };

describe("normalizeFocusRawInput", () => {
  it("strips spaces and newlines", () => {
    expect(normalizeFocusRawInput("he llo\n")).toBe("hello");
  });
});

describe("applyFocusInput", () => {
  const words = ["cat", "dog", "bird"];

  it("updates the current word buffer without advancing on partial input", () => {
    const result = applyFocusInput({
      words,
      wordIndex: 0,
      currentWordInput: "c",
      nextRaw: "ca",
      strictMode: false,
      matchOptions: caseInsensitive,
    });

    expect(result).toMatchObject({
      wordIndex: 0,
      currentWordInput: "ca",
      advanced: false,
      finished: false,
      rejected: false,
    });
  });

  it("advances without requiring a space when the word is complete", () => {
    const result = applyFocusInput({
      words,
      wordIndex: 0,
      currentWordInput: "ca",
      nextRaw: "cat",
      strictMode: false,
      matchOptions: caseInsensitive,
    });

    expect(result).toMatchObject({
      wordIndex: 1,
      currentWordInput: "",
      advanced: true,
      finished: false,
      rejected: false,
    });
  });

  it("ignores space characters instead of advancing early", () => {
    const result = applyFocusInput({
      words,
      wordIndex: 0,
      currentWordInput: "ca",
      nextRaw: "ca ",
      strictMode: false,
      matchOptions: caseInsensitive,
    });

    expect(result.advanced).toBe(false);
    expect(result.currentWordInput).toBe("ca");
  });

  it("rejects incorrect keystrokes in strict mode", () => {
    const result = applyFocusInput({
      words,
      wordIndex: 0,
      currentWordInput: "c",
      nextRaw: "cx",
      strictMode: true,
      matchOptions: caseInsensitive,
    });

    expect(result.rejected).toBe(true);
    expect(result.currentWordInput).toBe("c");
  });

  it("finishes after the last word", () => {
    const result = applyFocusInput({
      words,
      wordIndex: 2,
      currentWordInput: "bir",
      nextRaw: "bird",
      strictMode: false,
      matchOptions: caseInsensitive,
    });

    expect(result).toMatchObject({
      wordIndex: 3,
      currentWordInput: "",
      advanced: true,
      finished: true,
    });
  });

  it("matches words case-insensitively", () => {
    const result = applyFocusInput({
      words,
      wordIndex: 0,
      currentWordInput: "CA",
      nextRaw: "CAT",
      strictMode: false,
      matchOptions: caseInsensitive,
    });

    expect(result.advanced).toBe(true);
  });
});

describe("computeFocusStats", () => {
  it("does not award free spaces between completed words", () => {
    const stats = computeFocusStats(["hello", "world"], 1, "wo", 60_000, caseInsensitive);

    // hello (5) + wo (2) = 7 typed chars — no space counted
    expect(stats.totalTyped).toBe(7);
    expect(stats.correctChars).toBe(7);
    expect(roundWpm(stats.wpm)).toBe(1);
    expect(roundAccuracy(stats.accuracy)).toBe(100);
  });

  it("penalizes mistakes on the current word", () => {
    const stats = computeFocusStats(["hello"], 0, "hxxxx", 60_000, caseInsensitive);

    expect(stats.correctChars).toBe(1);
    expect(stats.totalTyped).toBe(5);
    expect(roundAccuracy(stats.accuracy)).toBe(20);
  });
});
