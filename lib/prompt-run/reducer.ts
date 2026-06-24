import { DEFAULT_GAME, MAX_REROLL_CHARGES, REROLL_CHARGES_PER_ROUND } from "@/lib/prompt-run/constants";
import { finalizeRoundScore, computeFailedGenerationBonus, computeScrapBonus } from "@/lib/prompt-run/scoring";
import { createId } from "@/lib/prompt-run/round";
import type { Game, GeneratedImage, Phase, Round, ShopItem } from "@/lib/prompt-run/types";

export type PromptRunModelState = {
  game: Game;
  round: Round | null;
};

export type PromptRunAction =
  | { type: "ROUND_START"; newRound: Round; willUnlockShop: boolean; nextShopItems: ShopItem[] }
  | { type: "ROUND_UPDATE"; round: Round }
  | {
      type: "ROUND_END";
      completedRound: Round;
      durationMs: number;
      streakUpdate?: { streak: number; streakRecord: number };
    }
  | { type: "SET_STREAK"; streak: number; streakRecord: number }
  | { type: "REROLL_CONSUME" }
  | { type: "SCRAP_ROUND" }
  | { type: "GENERATION_FAILED"; message?: string }
  | { type: "SHOP_SET_ITEMS"; items: ShopItem[] }
  | { type: "TOTAL_SCORE_ADJUST"; delta: number }
  | { type: "PHASE_SET"; phase: Phase }
  | { type: "GAME_UPDATE"; game: Partial<Game> }
  | { type: "GAME_RESET" }
  | {
      type: "RUN_START";
      newRound: Round;
      willUnlockShop: boolean;
      nextShopItems: ShopItem[];
    }
  | { type: "RESTORE"; state: PromptRunModelState }
  | { type: "SET_GENERATED_IMAGE"; image: GeneratedImage };

export function promptRunReducer(state: PromptRunModelState, action: PromptRunAction): PromptRunModelState {
  switch (action.type) {
    case "ROUND_START": {
      if (state.game.phase === "round") {
        return state;
      }
      return {
        game: {
          ...state.game,
          phase: "round",
          shopUnlocked: action.willUnlockShop,
          shop: { ...state.game.shop, items: action.nextShopItems },
        },
        round: action.newRound,
      };
    }
    case "ROUND_UPDATE": {
      if (state.game.phase !== "round" || !state.round) {
        return state;
      }
      return { ...state, round: action.round };
    }
    case "ROUND_END": {
      if (state.game.phase !== "round" || !state.round) {
        return state;
      }
      const { pickScore, roundBonuses, finalScore } = finalizeRoundScore(action.completedRound, action.durationMs);
      const completedRound = {
        ...action.completedRound,
        pickScore,
        roundBonuses,
        roundScore: finalScore,
      };
      return {
        game: {
          ...state.game,
          totalScore: state.game.totalScore + finalScore,
          completedRounds: state.game.completedRounds + 1,
          rerollCharges: Math.min(
            state.game.rerollCharges + REROLL_CHARGES_PER_ROUND + (action.completedRound.roundBonusRerolls || 0),
            MAX_REROLL_CHARGES,
          ),
          speedBonusCount: state.game.speedBonusCount + (roundBonuses.speedBonus > 0 ? 1 : 0),
          rounds: [...state.game.rounds, completedRound],
          ...(action.streakUpdate
            ? { streak: action.streakUpdate.streak, streakRecord: action.streakUpdate.streakRecord }
            : {}),
          phase: "generate",
        },
        round: null,
      };
    }
    case "SET_STREAK": {
      return {
        ...state,
        game: { ...state.game, streak: action.streak, streakRecord: action.streakRecord },
      };
    }
    case "REROLL_CONSUME": {
      if (state.game.phase !== "round" || state.game.rerollCharges <= 0) {
        return state;
      }
      return { ...state, game: { ...state.game, rerollCharges: state.game.rerollCharges - 1 } };
    }
    case "SCRAP_ROUND": {
      if (state.game.rounds.length === 0 || state.game.phase === "round") {
        return state;
      }
      const lastIndex = state.game.rounds.length - 1;
      const lastRound = state.game.rounds[lastIndex];
      if (lastRound.scrapped || lastRound.generationFailed || lastRound.generatedImage) {
        return state;
      }
      const extraPoints = computeScrapBonus(lastRound.roundScore);
      const updatedRounds = [...state.game.rounds];
      updatedRounds[lastIndex] = {
        ...lastRound,
        scrapped: true,
        roundScore: lastRound.roundScore + extraPoints,
        scrappedBonusAmount: extraPoints,
      };
      return {
        ...state,
        game: {
          ...state.game,
          totalScore: state.game.totalScore + extraPoints,
          rounds: updatedRounds,
          streak: 0,
          phase: "overview",
        },
      };
    }
    case "GENERATION_FAILED": {
      if (state.game.rounds.length === 0 || state.game.phase !== "generate") {
        return state;
      }
      const lastIndex = state.game.rounds.length - 1;
      const lastRound = state.game.rounds[lastIndex];
      if (lastRound.scrapped || lastRound.generationFailed || lastRound.generatedImage) {
        return state;
      }
      const extraPoints = computeFailedGenerationBonus(lastRound.roundScore);
      const updatedRounds = [...state.game.rounds];
      updatedRounds[lastIndex] = {
        ...lastRound,
        generationFailed: true,
        generationFailureBonusAmount: extraPoints,
        generationFailureMessage: action.message ?? null,
        roundScore: lastRound.roundScore + extraPoints,
      };
      return {
        ...state,
        game: {
          ...state.game,
          totalScore: state.game.totalScore + extraPoints,
          rounds: updatedRounds,
          streak: 0,
          phase: "overview",
        },
      };
    }
    case "SHOP_SET_ITEMS": {
      return { ...state, game: { ...state.game, shop: { ...state.game.shop, items: action.items } } };
    }
    case "TOTAL_SCORE_ADJUST": {
      return { ...state, game: { ...state.game, totalScore: state.game.totalScore + action.delta } };
    }
    case "GAME_UPDATE": {
      return { ...state, game: { ...state.game, ...action.game } };
    }
    case "PHASE_SET": {
      return { ...state, game: { ...state.game, phase: action.phase } };
    }
    case "GAME_RESET": {
      return { game: { ...DEFAULT_GAME, id: createId() }, round: null };
    }
    case "RUN_START": {
      return {
        game: {
          ...DEFAULT_GAME,
          id: createId(),
          phase: "round",
          shopUnlocked: action.willUnlockShop,
          shop: { ...DEFAULT_GAME.shop, items: action.nextShopItems },
        },
        round: action.newRound,
      };
    }
    case "RESTORE": {
      return action.state;
    }
    case "SET_GENERATED_IMAGE": {
      if (state.game.rounds.length === 0 || state.game.phase !== "generate") {
        return state;
      }
      const lastIndex = state.game.rounds.length - 1;
      const lastRound = state.game.rounds[lastIndex];
      const updatedRounds = [...state.game.rounds];
      updatedRounds[lastIndex] = { ...lastRound, generatedImage: action.image };
      return {
        ...state,
        game: { ...state.game, rounds: updatedRounds },
      };
    }
    default:
      return state;
  }
}
