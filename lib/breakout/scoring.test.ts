import { describe, expect, it } from "vitest";

import { brickPoints, isBreakoutScoreBetter, levelClearBonus, livesBonus } from "@/lib/breakout/scoring";

describe("brickPoints", () => {
  it("awards base points for the first brick of a volley", () => {
    expect(brickPoints(10, 0, 1)).toBe(10);
  });

  it("adds 10% per prior brick in the volley", () => {
    expect(brickPoints(10, 1, 1)).toBe(11);
    expect(brickPoints(10, 5, 1)).toBe(15);
  });

  it("applies the curse score multiplier", () => {
    expect(brickPoints(10, 0, 1.5)).toBe(15);
    expect(brickPoints(10, 2, 2)).toBe(24);
  });
});

describe("levelClearBonus", () => {
  it("scales with level and score multiplier", () => {
    expect(levelClearBonus(1, 1)).toBe(500);
    expect(levelClearBonus(3, 1)).toBe(1500);
    expect(levelClearBonus(2, 1.5)).toBe(1500);
  });
});

describe("livesBonus", () => {
  it("pays 250 per remaining life", () => {
    expect(livesBonus(0)).toBe(0);
    expect(livesBonus(3)).toBe(750);
  });
});

describe("isBreakoutScoreBetter", () => {
  const base = { score: 1000, level: 5, savedAt: "2026-07-08T00:00:00.000Z" };

  it("prefers a higher score", () => {
    expect(isBreakoutScoreBetter({ ...base, score: 1001 }, base)).toBe(true);
    expect(isBreakoutScoreBetter({ ...base, score: 999 }, base)).toBe(false);
  });

  it("breaks score ties with level", () => {
    expect(isBreakoutScoreBetter({ ...base, level: 6 }, base)).toBe(true);
    expect(isBreakoutScoreBetter({ ...base, level: 5 }, base)).toBe(false);
  });
});
