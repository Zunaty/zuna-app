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
});
