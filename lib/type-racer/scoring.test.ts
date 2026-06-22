import { describe, expect, it } from "vitest";

import { computeStats, roundAccuracy, roundWpm } from "@/lib/type-racer/scoring";

describe("computeStats", () => {
  it("returns 0 WPM when elapsed time is zero", () => {
    const stats = computeStats("hello", "hello", 0);

    expect(stats.wpm).toBe(0);
    expect(stats.rawWpm).toBe(0);
  });

  it("returns 100% accuracy for empty input", () => {
    const stats = computeStats("hello world", "", 5000);

    expect(stats.accuracy).toBe(100);
    expect(stats.totalTyped).toBe(0);
    expect(stats.correctChars).toBe(0);
  });

  it("computes WPM from correct characters over elapsed time", () => {
    const stats = computeStats("hello", "hello", 60_000);

    expect(stats.correctChars).toBe(5);
    expect(roundWpm(stats.wpm)).toBe(1);
    expect(roundWpm(stats.rawWpm)).toBe(1);
    expect(roundAccuracy(stats.accuracy)).toBe(100);
  });

  it("separates raw WPM from adjusted WPM when there are mistakes", () => {
    const stats = computeStats("hello", "hxxxx", 60_000);

    expect(stats.correctChars).toBe(1);
    expect(stats.totalTyped).toBe(5);
    expect(roundWpm(stats.wpm)).toBe(0);
    expect(roundWpm(stats.rawWpm)).toBe(1);
    expect(roundAccuracy(stats.accuracy)).toBe(20);
  });

  it("counts only matching positions as correct", () => {
    const stats = computeStats("abc", "axc", 30_000);

    expect(stats.correctChars).toBe(2);
    expect(stats.totalTyped).toBe(3);
    expect(roundAccuracy(stats.accuracy)).toBeCloseTo(66.7, 1);
  });
});
