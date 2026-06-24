import { describe, expect, it } from "vitest";

import { DEFAULT_GAME } from "@/lib/prompt-run/constants";
import { migratePromptRunState } from "@/lib/prompt-run/migrate-state";
import type { Round } from "@/lib/prompt-run/types";

const completedRound: Round = {
  id: "round-4",
  roundNumber: 4,
  roundStartTime: 0,
  roundEndTime: 14_000,
  roundDuration: 14_000,
  roundScore: 601,
  roundBonusRerolls: 0,
  roundCategories: [{ id: "1", name: "descriptors", skipped: false, availableOptions: [] }],
  currentCategory: null,
  roundVariables: [{ id: "1", name: "ornate", rarity: "rare", points: 601, streakMultiplier: null }],
  shopVariables: [],
  scrapped: false,
  scrappedBonusAmount: null,
  generationFailed: false,
  generationFailureBonusAmount: null,
  generationFailureMessage: null,
};

describe("migratePromptRunState", () => {
  it("adds missing round-end bonuses to saved rounds", () => {
    const state = {
      game: {
        ...DEFAULT_GAME,
        totalScore: 601,
        completedRounds: 1,
        rounds: [completedRound],
      },
      round: null,
    };

    const migrated = migratePromptRunState(state);

    expect(migrated.game.rounds[0]?.roundScore).toBe(851);
    expect(migrated.game.rounds[0]?.pickScore).toBe(601);
    expect(migrated.game.rounds[0]?.roundBonuses?.speedBonus).toBe(250);
    expect(migrated.game.totalScore).toBe(851);
  });
});
