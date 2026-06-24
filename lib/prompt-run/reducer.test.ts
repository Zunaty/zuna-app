import { describe, expect, it } from "vitest";

import { DEFAULT_GAME } from "@/lib/prompt-run/constants";
import { promptRunReducer } from "@/lib/prompt-run/reducer";
import type { Round } from "@/lib/prompt-run/types";

const baseRound: Round = {
  id: "round-1",
  roundNumber: 1,
  roundStartTime: 0,
  roundEndTime: null,
  roundDuration: null,
  roundScore: 120,
  roundBonusRerolls: 0,
  roundCategories: [],
  currentCategory: null,
  roundVariables: [],
  shopVariables: [],
  scrapped: false,
  scrappedBonusAmount: null,
  generationFailed: false,
  generationFailureBonusAmount: null,
  generationFailureMessage: null,
};

describe("promptRunReducer", () => {
  it("ends a round into generate phase", () => {
    const state = {
      game: { ...DEFAULT_GAME, phase: "round" as const },
      round: baseRound,
    };

    const next = promptRunReducer(state, {
      type: "ROUND_END",
      completedRound: { ...baseRound, roundEndTime: 1000, roundDuration: 1000 },
      durationMs: 1000,
      streakUpdate: { streak: 2, streakRecord: 2 },
    });

    expect(next.game.phase).toBe("generate");
    expect(next.game.totalScore).toBe(120);
    expect(next.game.completedRounds).toBe(1);
    expect(next.round).toBeNull();
  });

  it("applies round-end bonuses when a round completes", () => {
    const state = {
      game: { ...DEFAULT_GAME, phase: "round" as const },
      round: { ...baseRound, roundScore: 601 },
    };

    const next = promptRunReducer(state, {
      type: "ROUND_END",
      completedRound: {
        ...baseRound,
        roundScore: 601,
        roundEndTime: 14_000,
        roundDuration: 14_000,
        roundVariables: [{ id: "pick-1", name: "ornate", rarity: "rare", points: 601, streakMultiplier: null }],
        roundCategories: [{ id: "1", name: "descriptors", skipped: false, availableOptions: [] }],
      },
      durationMs: 14_000,
      streakUpdate: { streak: 1, streakRecord: 1 },
    });

    expect(next.game.rounds[0]?.roundScore).toBe(851);
    expect(next.game.rounds[0]?.pickScore).toBe(601);
    expect(next.game.rounds[0]?.roundBonuses?.speedBonus).toBe(250);
    expect(next.game.totalScore).toBe(851);
  });

  it("scraps the last round for bonus points", () => {
    const state = {
      game: {
        ...DEFAULT_GAME,
        phase: "generate" as const,
        totalScore: 120,
        rounds: [baseRound],
      },
      round: null,
    };

    const next = promptRunReducer(state, { type: "SCRAP_ROUND" });

    expect(next.game.phase).toBe("overview");
    expect(next.game.totalScore).toBe(160);
    expect(next.game.rounds[0]?.scrapped).toBe(true);
    expect(next.game.rounds[0]?.scrappedBonusAmount).toBe(40);
  });

  it("applies double scrap bonus when generation fails", () => {
    const state = {
      game: {
        ...DEFAULT_GAME,
        phase: "generate" as const,
        totalScore: 726,
        rounds: [{ ...baseRound, roundScore: 726 }],
      },
      round: null,
    };

    const next = promptRunReducer(state, {
      type: "GENERATION_FAILED",
      message: "Daily generation limit reached.",
    });

    expect(next.game.phase).toBe("overview");
    expect(next.game.totalScore).toBe(1210);
    expect(next.game.rounds[0]?.generationFailed).toBe(true);
    expect(next.game.rounds[0]?.generationFailureBonusAmount).toBe(484);
    expect(next.game.rounds[0]?.roundScore).toBe(1210);
    expect(next.game.rounds[0]?.generationFailureMessage).toBe("Daily generation limit reached.");
    expect(next.game.streak).toBe(0);
  });
});
