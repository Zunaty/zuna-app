export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type Phase = "fresh" | "round" | "generate" | "overview";

export type PromptVariable = {
  id: string;
  name: string;
  rarity: Rarity;
  points: number;
  streakMultiplier: number | null;
  /** Set when the player picks this variable (category it was chosen from). */
  categoryName?: string;
};

export type RoundCategory = {
  id: string;
  name: string;
  skipped: boolean;
  availableOptions: PromptVariable[];
};

export type GeneratedImage = {
  url: string;
  width?: number;
  height?: number;
  seed?: number;
};

export type RoundBonusBreakdown = {
  speedBonus: number;
  epicBonus: number;
  perfectBonus: number;
};

export type Round = {
  id: string;
  roundNumber: number;
  roundStartTime: number;
  roundEndTime: number | null;
  roundDuration: number | null;
  roundScore: number;
  roundBonusRerolls: number;
  roundCategories: RoundCategory[];
  currentCategory: RoundCategory | null;
  roundVariables: PromptVariable[];
  shopVariables: PromptVariable[];
  shopSpent?: number;
  shopEvents?: ShopEvent[];
  scrapped: boolean;
  scrappedBonusAmount: number | null;
  generationFailed: boolean;
  generationFailureBonusAmount: number | null;
  generationFailureMessage?: string | null;
  /** Pick score before round-end bonuses (speed / epic / perfect). */
  pickScore?: number;
  roundBonuses?: RoundBonusBreakdown;
  generatedImage?: GeneratedImage | null;
};

export type Buff = {
  id: string;
  type: "buff" | "debuff";
  active: boolean;
  name: string;
  description: string;
  roundStart: number;
  duration: number;
};

export type ShopItem = {
  id: string;
  name: string;
  rarity: Rarity;
  price: number;
  description?: string;
  type: "variable" | "buff";
  variable?: PromptVariable;
  isOnCooldown?: boolean;
  cooldownEndRound?: number | null;
};

export type Shop = {
  possibleRarities: Rarity[];
  items: ShopItem[];
};

export type ShopEvent = {
  id: string;
  action: "purchase" | "refresh";
  timestamp: number;
  price: number;
  itemName?: string;
  itemRarity?: Rarity;
  itemType?: "variable" | "buff";
};

export type Game = {
  id: string;
  phase: Phase;
  completedRounds: number;
  totalScore: number;
  rerollCharges: number;
  streak: number;
  streakRecord: number;
  speedBonusCount: number;
  rounds: Round[];
  shopUnlocked: boolean;
  shopItemsUsed: number;
  buffs: Buff[];
  shop: Shop;
};
