import type { Game, Phase, Shop, ShopItem } from "@/lib/prompt-run/types";

export const MAX_ROUNDS = 7;

export const DEFAULT_CATEGORY_SEQUENCE = [
  "descriptors",
  "subjects",
  "actions",
  "styles",
  "backgrounds",
  "colors",
] as const;

export const MIN_CATEGORY_LENGTH = 3;
export const MAX_CATEGORY_LENGTH = 10;
export const REQUIRED_SELECTIONS = 2;
export const OPTIONS_PER_CATEGORY = 3;

export const INITIAL_REROLL_CHARGES = 3;
export const REROLL_CHARGES_PER_ROUND = 1;
export const MAX_REROLL_CHARGES = 5;
export const MAX_BONUS_REROLLS = 2;
export const BONUS_REROLL_BASE_POINTS = 100;
export const FIRST_BONUS_RATIO = 2;

export const RARITY_PROBABILITIES = {
  common: 0.45,
  uncommon: 0.25,
  rare: 0.15,
  epic: 0.1,
  legendary: 0.05,
} as const;

export const POINT_RANGES = {
  common: { min: 10, max: 19 },
  uncommon: { min: 20, max: 49 },
  rare: { min: 50, max: 99 },
  epic: { min: 100, max: 199 },
  legendary: { min: 200, max: 300 },
} as const;

export const SPEED_BONUS_POINTS = 250;
export const SPEED_BONUS_THRESHOLD = 30;
export const PERFECT_ROUND_BONUS_POINTS = 500;
export const EPIC_ROUND_BONUS_POINTS = 400;

export const STREAK_MULTIPLIERS = {
  FIRE: 0.5,
  UNSTOPPABLE: 1.0,
  LEGENDARY: 1.5,
} as const;

export const STREAK_THRESHOLDS = {
  FIRE: 3,
  UNSTOPPABLE: 5,
  LEGENDARY: 7,
} as const;

export const SHOP_UNLOCK_ROUND = 2;
export const SHOP_ITEMS_COUNT = 3;
export const SHOP_REFRESH_BASE_COST = 250;
export const SHOP_ITEM_COOLDOWN_ROUNDS = 2;

export const DEFAULT_SHOP: Shop = {
  possibleRarities: ["rare", "legendary"],
  items: [],
};

export const DEFAULT_GAME: Game = {
  id: "default",
  phase: "fresh" satisfies Phase,
  totalScore: 0,
  completedRounds: 0,
  rerollCharges: INITIAL_REROLL_CHARGES,
  streak: 0,
  streakRecord: 0,
  speedBonusCount: 0,
  rounds: [],
  shopUnlocked: false,
  shopItemsUsed: 0,
  buffs: [],
  shop: DEFAULT_SHOP,
};

export const NON_VARIABLE_SHOP_ITEMS: ShopItem[] = [
  {
    id: "reroll_charge",
    name: "Reroll Charge",
    rarity: "rare",
    price: 250,
    description: "Gain 1 reroll charge",
    type: "buff",
  },
  {
    id: "reroll_charge_x3",
    name: "Reroll Charge x3",
    rarity: "epic",
    price: 500,
    description: "Gain 3 reroll charges",
    type: "buff",
  },
  {
    id: "rarity_boost",
    name: "Rarity Boost",
    rarity: "legendary",
    price: 500,
    description: "Increased chance of rare or better items",
    type: "buff",
  },
];
