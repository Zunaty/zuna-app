import { describe, expect, it } from "vitest";

import { createBricks, LEVEL_COUNT, LEVEL_LAYOUTS, loopHpBonus, pickLayoutIndex } from "@/lib/breakout/levels";

describe("LEVEL_LAYOUTS", () => {
  it("only uses known layout characters", () => {
    for (const layout of LEVEL_LAYOUTS) {
      for (const row of layout) {
        expect(row).toMatch(/^[.12#]+$/);
      }
    }
  });

  it("has at least one breakable brick per level", () => {
    for (let i = 0; i < LEVEL_COUNT; i += 1) {
      const bricks = createBricks(i, 0, false);
      expect(bricks.some((brick) => brick.breakable)).toBe(true);
    }
  });
});

describe("createBricks", () => {
  it("skips empty cells", () => {
    const layout = LEVEL_LAYOUTS[2];
    const cells = layout
      .join("")
      .split("")
      .filter((char) => char !== ".").length;

    expect(createBricks(2, 0, false)).toHaveLength(cells);
  });

  it("gives tough bricks 2 hp and applies the hp bonus to breakables only", () => {
    const bricks = createBricks(4, 1, false);
    const tough = bricks.find((brick) => brick.breakable && brick.maxHp > 2);
    const unbreakable = bricks.find((brick) => !brick.breakable);

    expect(tough).toBeDefined();
    expect(tough?.hp).toBe(3);
    expect(unbreakable?.hp).toBe(Number.POSITIVE_INFINITY);
  });

  it("pays more for top rows than bottom rows", () => {
    const bricks = createBricks(0, 0, false);
    const topRow = bricks.filter((brick) => brick.row === 0);
    const bottomRow = bricks.filter((brick) => brick.row === 3);

    expect(topRow[0].points).toBeGreaterThan(bottomRow[0].points);
  });

  it("hides bricks under the blackout curse", () => {
    const normal = createBricks(0, 0, false);
    const blackout = createBricks(0, 0, true);

    expect(normal.every((brick) => brick.revealed)).toBe(true);
    expect(blackout.every((brick) => !brick.revealed)).toBe(true);
  });
});

describe("pickLayoutIndex", () => {
  it("walks layouts in order for classic", () => {
    expect(pickLayoutIndex("classic", 1, 42).index).toBe(0);
    expect(pickLayoutIndex("classic", 5, 42).index).toBe(4);
    expect(pickLayoutIndex("classic", 5, 42).rngState).toBe(42);
  });

  it("picks a seeded layout and advances rng for roguelite", () => {
    const result = pickLayoutIndex("roguelite", 3, 42);

    expect(result.index).toBeGreaterThanOrEqual(0);
    expect(result.index).toBeLessThan(LEVEL_COUNT);
    expect(result.rngState).not.toBe(42);
    expect(pickLayoutIndex("roguelite", 3, 42).index).toBe(result.index);
  });
});

describe("loopHpBonus", () => {
  it("is zero for classic", () => {
    expect(loopHpBonus("classic", 5)).toBe(0);
  });

  it("adds 1 hp per full loop of the layouts in roguelite", () => {
    expect(loopHpBonus("roguelite", 1)).toBe(0);
    expect(loopHpBonus("roguelite", 5)).toBe(0);
    expect(loopHpBonus("roguelite", 6)).toBe(1);
    expect(loopHpBonus("roguelite", 11)).toBe(2);
  });
});
