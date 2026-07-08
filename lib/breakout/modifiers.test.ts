import { describe, expect, it } from "vitest";

import { PADDLE_BASE_WIDTH, PADDLE_MAX_WIDTH } from "@/lib/breakout/constants";
import {
  BREAKOUT_MODIFIERS,
  countCurses,
  deriveRunConfig,
  drawDraftOptions,
  DRAFT_OPTION_COUNT,
} from "@/lib/breakout/modifiers";

describe("deriveRunConfig", () => {
  it("returns base config for no modifiers", () => {
    const config = deriveRunConfig([]);

    expect(config.paddleWidth).toBe(PADDLE_BASE_WIDTH);
    expect(config.ballSpeedMult).toBe(1);
    expect(config.scoreMult).toBe(1);
    expect(config.ballCount).toBe(1);
  });

  it("stacks wide paddle multiplicatively and clamps at the max", () => {
    const once = deriveRunConfig(["wide-paddle"]);
    expect(once.paddleWidth).toBe(Math.round(PADDLE_BASE_WIDTH * 1.25));

    const many = deriveRunConfig(["wide-paddle", "wide-paddle", "wide-paddle", "wide-paddle"]);
    expect(many.paddleWidth).toBe(PADDLE_MAX_WIDTH);
  });

  it("floors stacked slow ball at 70% speed", () => {
    const config = deriveRunConfig(["slow-ball", "slow-ball", "slow-ball", "slow-ball", "slow-ball"]);

    expect(config.ballSpeedMult).toBeCloseTo(0.7);
  });

  it("multiplies curse score bonuses together", () => {
    const config = deriveRunConfig(["narrow-paddle", "turbo-ball", "hard-bricks"]);

    expect(config.scoreMult).toBeCloseTo(1.25 * 1.25 * 1.3);
    expect(config.brickHpBonus).toBe(1);
    expect(config.ballSpeedMult).toBeCloseTo(1.15);
  });

  it("adds a ball per multiball stack", () => {
    expect(deriveRunConfig(["multiball"]).ballCount).toBe(2);
    expect(deriveRunConfig(["multiball", "multiball"]).ballCount).toBe(3);
  });

  it("sets unique flags", () => {
    const config = deriveRunConfig(["sticky-paddle", "piercing", "blackout", "combo-keeper"]);

    expect(config.sticky).toBe(true);
    expect(config.piercing).toBe(true);
    expect(config.blackout).toBe(true);
    expect(config.comboKeeper).toBe(true);
    expect(config.scoreMult).toBeCloseTo(1.5);
  });
});

describe("countCurses", () => {
  it("counts only curse modifiers", () => {
    expect(countCurses(["wide-paddle", "narrow-paddle", "blackout", "multiball"])).toBe(2);
  });
});

describe("drawDraftOptions", () => {
  it("draws three distinct options", () => {
    const { options } = drawDraftOptions([], 12345);

    expect(options).toHaveLength(DRAFT_OPTION_COUNT);
    expect(new Set(options).size).toBe(DRAFT_OPTION_COUNT);
  });

  it("is deterministic for the same rng state", () => {
    const a = drawDraftOptions([], 777);
    const b = drawDraftOptions([], 777);

    expect(a.options).toEqual(b.options);
    expect(a.rngState).toBe(b.rngState);
  });

  it("advances the rng state", () => {
    const { rngState } = drawDraftOptions([], 777);

    expect(rngState).not.toBe(777);
  });

  it("excludes taken uniques from the pool", () => {
    const uniques = Object.values(BREAKOUT_MODIFIERS)
      .filter((modifier) => modifier.unique)
      .map((modifier) => modifier.id);

    // With every unique taken, many seeds should never offer one again.
    for (let seed = 1; seed <= 50; seed += 1) {
      const { options } = drawDraftOptions(uniques, seed);
      for (const option of options) {
        expect(uniques).not.toContain(option);
      }
    }
  });

  it("still offers stackable modifiers the player already has", () => {
    let offered = false;

    for (let seed = 1; seed <= 50 && !offered; seed += 1) {
      const { options } = drawDraftOptions(["wide-paddle"], seed);
      offered = options.includes("wide-paddle");
    }

    expect(offered).toBe(true);
  });
});
