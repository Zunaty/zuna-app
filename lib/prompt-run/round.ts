import { OPTIONS_PER_CATEGORY } from "@/lib/prompt-run/constants";
import { createPromptVariable } from "@/lib/prompt-run/rarity";
import type { PromptVariable, Round, RoundCategory } from "@/lib/prompt-run/types";
import { pickRandomWords } from "@/lib/prompt-run/variables";

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `prompt-run-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createCategoryOptions(
  category: string,
  random: () => number,
  options?: { rarityBoost?: boolean },
): PromptVariable[] {
  const words = pickRandomWords(category, OPTIONS_PER_CATEGORY, random);
  return words.map((name) => {
    const rarityRandom = options?.rarityBoost ? random() * 0.2 : random();
    return createPromptVariable(createId(), name, rarityRandom, random());
  });
}

export function createRound(params: {
  roundNumber: number;
  categorySequence: readonly string[];
  random: () => number;
  now?: number;
  rarityBoost?: boolean;
}): Round {
  const categories: RoundCategory[] = params.categorySequence.map((name) => {
    const categoryOptions = createCategoryOptions(name, params.random, {
      rarityBoost: params.rarityBoost,
    });
    return {
      id: createId(),
      name,
      skipped: false,
      availableOptions: categoryOptions,
    };
  });

  return {
    id: createId(),
    roundNumber: params.roundNumber,
    roundStartTime: params.now ?? Date.now(),
    roundEndTime: null,
    roundDuration: null,
    roundScore: 0,
    roundBonusRerolls: 0,
    roundCategories: categories,
    currentCategory: categories[0] ?? null,
    roundVariables: [],
    shopVariables: [],
    shopSpent: 0,
    shopEvents: [],
    scrapped: false,
    scrappedBonusAmount: null,
  };
}
