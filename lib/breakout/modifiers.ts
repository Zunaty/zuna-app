import { PADDLE_BASE_WIDTH, PADDLE_MAX_WIDTH, PADDLE_MIN_WIDTH } from "@/lib/breakout/constants";
import { nextRandom } from "@/lib/breakout/rng";

export type BreakoutRarity = "common" | "uncommon" | "rare" | "epic";

export type BreakoutModifierId =
  | "wide-paddle"
  | "slow-ball"
  | "extra-life"
  | "sticky-paddle"
  | "piercing"
  | "multiball"
  | "combo-keeper"
  | "narrow-paddle"
  | "turbo-ball"
  | "hard-bricks"
  | "blackout";

export type BreakoutModifier = {
  id: BreakoutModifierId;
  name: string;
  description: string;
  rarity: BreakoutRarity;
  kind: "boon" | "curse";
  /** Unique modifiers drop out of the draft pool once taken. */
  unique: boolean;
};

export const BREAKOUT_MODIFIERS: Record<BreakoutModifierId, BreakoutModifier> = {
  "wide-paddle": {
    id: "wide-paddle",
    name: "Wide paddle",
    description: "+25% paddle width.",
    rarity: "common",
    kind: "boon",
    unique: false,
  },
  "slow-ball": {
    id: "slow-ball",
    name: "Slow ball",
    description: "−10% ball speed.",
    rarity: "common",
    kind: "boon",
    unique: false,
  },
  "extra-life": {
    id: "extra-life",
    name: "Extra life",
    description: "+1 life, right now.",
    rarity: "uncommon",
    kind: "boon",
    unique: false,
  },
  "sticky-paddle": {
    id: "sticky-paddle",
    name: "Sticky paddle",
    description: "The ball sticks on catch — aim and re-launch.",
    rarity: "rare",
    kind: "boon",
    unique: true,
  },
  piercing: {
    id: "piercing",
    name: "Piercing",
    description: "The first brick broken each volley doesn't bounce the ball.",
    rarity: "rare",
    kind: "boon",
    unique: true,
  },
  multiball: {
    id: "multiball",
    name: "Multiball",
    description: "+1 permanent extra ball. Lose a life only when the last ball drops.",
    rarity: "epic",
    kind: "boon",
    unique: false,
  },
  "combo-keeper": {
    id: "combo-keeper",
    name: "Combo keeper",
    description: "Volley combo halves on paddle touch instead of resetting.",
    rarity: "epic",
    kind: "boon",
    unique: true,
  },
  "narrow-paddle": {
    id: "narrow-paddle",
    name: "Narrow paddle",
    description: "−20% paddle width. +25% score.",
    rarity: "uncommon",
    kind: "curse",
    unique: false,
  },
  "turbo-ball": {
    id: "turbo-ball",
    name: "Turbo ball",
    description: "+15% ball speed. +25% score.",
    rarity: "uncommon",
    kind: "curse",
    unique: false,
  },
  "hard-bricks": {
    id: "hard-bricks",
    name: "Hard bricks",
    description: "All bricks +1 HP. +30% score.",
    rarity: "rare",
    kind: "curse",
    unique: false,
  },
  blackout: {
    id: "blackout",
    name: "Blackout",
    description: "Bricks are invisible until first hit. +50% score.",
    rarity: "epic",
    kind: "curse",
    unique: true,
  },
};

export const BREAKOUT_MODIFIER_IDS = Object.keys(BREAKOUT_MODIFIERS) as BreakoutModifierId[];

const RARITY_WEIGHT: Record<BreakoutRarity, number> = {
  common: 40,
  uncommon: 30,
  rare: 20,
  epic: 10,
};

export const DRAFT_OPTION_COUNT = 3;

export type BreakoutRunConfig = {
  paddleWidth: number;
  ballSpeedMult: number;
  brickHpBonus: number;
  scoreMult: number;
  ballCount: number;
  sticky: boolean;
  piercing: boolean;
  blackout: boolean;
  comboKeeper: boolean;
};

export const BASE_RUN_CONFIG: BreakoutRunConfig = {
  paddleWidth: PADDLE_BASE_WIDTH,
  ballSpeedMult: 1,
  brickHpBonus: 0,
  scoreMult: 1,
  ballCount: 1,
  sticky: false,
  piercing: false,
  blackout: false,
  comboKeeper: false,
};

const MIN_BALL_SPEED_MULT = 0.7;

/** Fold picked modifiers over base constants. Derived, never stored. */
export function deriveRunConfig(modifiers: readonly BreakoutModifierId[]): BreakoutRunConfig {
  let paddleWidthMult = 1;
  const config: BreakoutRunConfig = { ...BASE_RUN_CONFIG };

  for (const id of modifiers) {
    switch (id) {
      case "wide-paddle":
        paddleWidthMult *= 1.25;
        break;
      case "slow-ball":
        config.ballSpeedMult = Math.max(MIN_BALL_SPEED_MULT, config.ballSpeedMult * 0.9);
        break;
      case "sticky-paddle":
        config.sticky = true;
        break;
      case "piercing":
        config.piercing = true;
        break;
      case "multiball":
        config.ballCount += 1;
        break;
      case "combo-keeper":
        config.comboKeeper = true;
        break;
      case "narrow-paddle":
        paddleWidthMult *= 0.8;
        config.scoreMult *= 1.25;
        break;
      case "turbo-ball":
        config.ballSpeedMult *= 1.15;
        config.scoreMult *= 1.25;
        break;
      case "hard-bricks":
        config.brickHpBonus += 1;
        config.scoreMult *= 1.3;
        break;
      case "blackout":
        config.blackout = true;
        config.scoreMult *= 1.5;
        break;
      case "extra-life":
        // Applied immediately on pick, not part of derived config.
        break;
    }
  }

  config.paddleWidth = Math.min(
    PADDLE_MAX_WIDTH,
    Math.max(PADDLE_MIN_WIDTH, Math.round(PADDLE_BASE_WIDTH * paddleWidthMult)),
  );

  return config;
}

export function countCurses(modifiers: readonly BreakoutModifierId[]): number {
  return modifiers.filter((id) => BREAKOUT_MODIFIERS[id].kind === "curse").length;
}

/**
 * Draw 3 distinct draft options, weighted by rarity, excluding uniques the
 * player already holds.
 */
export function drawDraftOptions(
  taken: readonly BreakoutModifierId[],
  rngState: number,
): { options: BreakoutModifierId[]; rngState: number } {
  const takenSet = new Set(taken);
  let pool = BREAKOUT_MODIFIER_IDS.filter((id) => !BREAKOUT_MODIFIERS[id].unique || !takenSet.has(id));

  const options: BreakoutModifierId[] = [];
  let state = rngState;

  while (options.length < DRAFT_OPTION_COUNT && pool.length > 0) {
    const totalWeight = pool.reduce((sum, id) => sum + RARITY_WEIGHT[BREAKOUT_MODIFIERS[id].rarity], 0);
    const roll = nextRandom(state);
    state = roll.next;

    let threshold = roll.value * totalWeight;
    let picked = pool[pool.length - 1];

    for (const id of pool) {
      threshold -= RARITY_WEIGHT[BREAKOUT_MODIFIERS[id].rarity];
      if (threshold < 0) {
        picked = id;
        break;
      }
    }

    options.push(picked);
    pool = pool.filter((id) => id !== picked);
  }

  return { options, rngState: state };
}
