import { describe, expect, it } from "vitest";

import { assemblePrompt } from "@/lib/prompt-run/assemble-prompt";
import { rollPointsForRarity, rollRarity } from "@/lib/prompt-run/rarity";
import {
  computePickScore,
  computeRoundBonuses,
  computeScrapBonus,
  computeFailedGenerationBonus,
  finalizeRoundScore,
  getStreakMultiplier,
  nextStreakAfterPick,
} from "@/lib/prompt-run/scoring";
import type { PromptVariable, RoundCategory } from "@/lib/prompt-run/types";

function variable(name: string, rarity: PromptVariable["rarity"], points: number): PromptVariable {
  return { id: name, name, rarity, points, streakMultiplier: null };
}

describe("rollRarity", () => {
  it("returns common for high random units", () => {
    expect(rollRarity(0.99)).toBe("common");
  });

  it("returns legendary for low random units", () => {
    expect(rollRarity(0.01)).toBe("legendary");
  });
});

describe("rollPointsForRarity", () => {
  it("stays within the configured range", () => {
    expect(rollPointsForRarity("rare", 0)).toBe(50);
    expect(rollPointsForRarity("rare", 0.99)).toBe(99);
  });
});

describe("streak scoring", () => {
  it("applies fire tier bonus at streak 3", () => {
    expect(getStreakMultiplier(3)).toBe(0.5);
    expect(computePickScore(100, 3)).toBe(150);
  });

  it("resets streak on common picks", () => {
    expect(nextStreakAfterPick("common", 5)).toBe(0);
    expect(nextStreakAfterPick("rare", 2)).toBe(3);
  });
});

describe("round bonuses", () => {
  const categories: RoundCategory[] = [{ id: "1", name: "descriptors", skipped: false, availableOptions: [] }];

  it("adds speed bonus under threshold", () => {
    const bonuses = computeRoundBonuses([variable("a", "rare", 50)], categories, 20_000);
    expect(bonuses.speedBonus).toBe(250);
  });

  it("finalizes round score with bonuses", () => {
    const result = finalizeRoundScore(
      {
        roundScore: 100,
        roundVariables: [variable("a", "legendary", 200)],
        roundCategories: categories,
      },
      20_000,
    );
    expect(result.pickScore).toBe(100);
    expect(result.finalScore).toBe(100 + 250 + 500 + 400);
    expect(result.roundBonuses).toEqual({ speedBonus: 250, epicBonus: 400, perfectBonus: 500 });
  });

  it("withholds speed bonus when a category was skipped", () => {
    const skippedCategories: RoundCategory[] = [
      { id: "1", name: "descriptors", skipped: true, availableOptions: [] },
      { id: "2", name: "subjects", skipped: false, availableOptions: [] },
    ];
    const bonuses = computeRoundBonuses([variable("a", "rare", 50)], skippedCategories, 20_000);
    expect(bonuses.speedBonus).toBe(0);
  });
});

describe("assemblePrompt", () => {
  it("joins round and shop variables", () => {
    expect(assemblePrompt([variable("ethereal", "rare", 50)], [variable("neon city", "epic", 120)])).toBe(
      "ethereal, neon city",
    );
  });
});

describe("computeScrapBonus", () => {
  it("returns one third of round score floored", () => {
    expect(computeScrapBonus(301)).toBe(100);
  });
});

describe("computeFailedGenerationBonus", () => {
  it("returns double the scrap bonus", () => {
    expect(computeFailedGenerationBonus(726)).toBe(484);
  });
});
