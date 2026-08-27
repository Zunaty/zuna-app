import { describe, expect, it } from "vitest";

import { ROCK_RADIUS } from "@/lib/asteroids/constants";
import { nextSize, spawnWaveRocks, splitRock, waveLargeCount } from "@/lib/asteroids/waves";

describe("waveLargeCount", () => {
  it("starts at 4 and caps at 8", () => {
    expect(waveLargeCount(1, 1)).toBe(4);
    expect(waveLargeCount(5, 1)).toBe(8);
    expect(waveLargeCount(8, 1)).toBe(8);
  });
});

describe("spawnWaveRocks", () => {
  it("is deterministic for the same seed", () => {
    const ship = { x: 320, y: 240 };
    const a = spawnWaveRocks(1, ship, 1, 42, 1);
    const b = spawnWaveRocks(1, ship, 1, 42, 1);

    expect(a.rocks).toEqual(b.rocks);
    expect(a.rngState).toBe(b.rngState);
  });

  it("spawns the wave budget as large rocks", () => {
    const { rocks } = spawnWaveRocks(1, { x: 320, y: 240 }, 1, 7, 1);

    expect(rocks).toHaveLength(4);
    expect(rocks.every((rock) => rock.size === "large")).toBe(true);
    expect(rocks.every((rock) => rock.radius === ROCK_RADIUS.large)).toBe(true);
  });
});

describe("splitRock", () => {
  it("turns a large rock into two medium fragments", () => {
    const parent = spawnWaveRocks(1, { x: 320, y: 240 }, 1, 3, 1).rocks[0];
    const { fragments } = splitRock(parent, 10, 99);

    expect(nextSize("large")).toBe("medium");
    expect(fragments).toHaveLength(2);
    expect(fragments.every((rock) => rock.size === "medium")).toBe(true);
  });

  it("does not split small rocks", () => {
    expect(nextSize("small")).toBeNull();
  });
});
