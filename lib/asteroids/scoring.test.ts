import { describe, expect, it } from "vitest";

import { livesBonus, rockPoints, starPoints, waveClearBonus } from "@/lib/asteroids/scoring";

describe("rockPoints", () => {
  it("pays more for smaller rocks", () => {
    expect(rockPoints("large", 1)).toBe(20);
    expect(rockPoints("medium", 1)).toBe(50);
    expect(rockPoints("small", 1)).toBe(100);
  });

  it("applies the score multiplier", () => {
    expect(rockPoints("small", 1.5)).toBe(150);
  });
});

describe("starPoints", () => {
  it("scales with the multiplier", () => {
    expect(starPoints(1)).toBe(250);
    expect(starPoints(1.5)).toBe(375);
  });
});

describe("waveClearBonus", () => {
  it("scales with wave number", () => {
    expect(waveClearBonus(1, 1)).toBe(500);
    expect(waveClearBonus(3, 1)).toBe(1500);
    expect(waveClearBonus(2, 1.5)).toBe(1500);
  });
});

describe("livesBonus", () => {
  it("pays 250 per remaining life", () => {
    expect(livesBonus(0)).toBe(0);
    expect(livesBonus(3)).toBe(750);
  });
});
