import { computeRoundBonuses, sumPickScoresFromRound } from "@/lib/prompt-run/scoring";
import type { PromptRunModelState } from "@/lib/prompt-run/reducer";
import type { Round } from "@/lib/prompt-run/types";

function migrateRound(round: Round): { round: Round; scoreDelta: number } {
  if (!round.roundDuration) {
    return { round, scoreDelta: 0 };
  }

  const roundBonuses =
    round.roundBonuses ?? computeRoundBonuses(round.roundVariables, round.roundCategories, round.roundDuration);
  const pickScore = round.pickScore ?? sumPickScoresFromRound(round);
  const bonusTotal = roundBonuses.speedBonus + roundBonuses.epicBonus + roundBonuses.perfectBonus;
  const scrapAmount = round.scrappedBonusAmount ?? 0;
  const failureAmount = round.generationFailureBonusAmount ?? 0;
  const expectedWithBonuses = pickScore + bonusTotal;
  const expectedFinal = expectedWithBonuses + scrapAmount + failureAmount;

  if (round.roundScore === pickScore + scrapAmount && bonusTotal > 0) {
    return {
      round: { ...round, pickScore, roundBonuses, roundScore: expectedFinal },
      scoreDelta: bonusTotal,
    };
  }

  if (round.pickScore == null || round.roundBonuses == null) {
    return {
      round: { ...round, pickScore, roundBonuses },
      scoreDelta: 0,
    };
  }

  return { round, scoreDelta: 0 };
}

export function migratePromptRunState(state: PromptRunModelState): PromptRunModelState {
  let scoreDelta = 0;
  const rounds = state.game.rounds.map((round) => {
    const migrated = migrateRound(round);
    scoreDelta += migrated.scoreDelta;
    return migrated.round;
  });

  if (scoreDelta === 0) {
    return state;
  }

  return {
    ...state,
    game: {
      ...state.game,
      rounds,
      totalScore: state.game.totalScore + scoreDelta,
    },
  };
}
