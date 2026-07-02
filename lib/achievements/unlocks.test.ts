import { describe, expect, it } from "vitest";

import { ACHIEVEMENT_LIST, isAchievementId } from "@/lib/achievements/definitions";
import { getLevelForPoints, getLevelProgress, getTotalPoints, POINTS_PER_LEVEL } from "@/lib/achievements/points";
import {
  getUnlockedIds,
  mergeUnlocks,
  resolveDerivedUnlocks,
  sanitizeUnlocks,
  type UnlockedAchievements,
} from "@/lib/achievements/unlocks";

describe("isAchievementId", () => {
  it("accepts every catalog id", () => {
    for (const definition of ACHIEVEMENT_LIST) {
      expect(isAchievementId(definition.id)).toBe(true);
    }
  });

  it("rejects unknown ids", () => {
    expect(isAchievementId("not-a-real-achievement")).toBe(false);
    expect(isAchievementId("")).toBe(false);
  });
});

describe("sanitizeUnlocks", () => {
  it("drops unknown ids and invalid timestamps", () => {
    const result = sanitizeUnlocks({
      "type-first-run": "2026-07-01T00:00:00.000Z",
      "made-up-id": "2026-07-01T00:00:00.000Z",
      "type-60-wpm": "not-a-date",
      "type-perfect": 42,
    });

    expect(result).toEqual({ "type-first-run": "2026-07-01T00:00:00.000Z" });
  });

  it("returns an empty object for non-object input", () => {
    expect(sanitizeUnlocks(null)).toEqual({});
    expect(sanitizeUnlocks("nope")).toEqual({});
  });
});

describe("mergeUnlocks", () => {
  it("unions both sides", () => {
    const merged = mergeUnlocks(
      { "type-first-run": "2026-07-01T00:00:00.000Z" },
      { "prompt-run-first-round": "2026-07-02T00:00:00.000Z" },
    );

    expect(getUnlockedIds(merged).sort()).toEqual(["prompt-run-first-round", "type-first-run"]);
  });

  it("keeps the earliest timestamp when both sides have an unlock", () => {
    const merged = mergeUnlocks(
      { "type-first-run": "2026-07-02T00:00:00.000Z" },
      { "type-first-run": "2026-07-01T00:00:00.000Z" },
    );

    expect(merged["type-first-run"]).toBe("2026-07-01T00:00:00.000Z");
  });
});

describe("resolveDerivedUnlocks", () => {
  const allTourPages: UnlockedAchievements = {
    "explore-about": "2026-07-01T00:00:00.000Z",
    "explore-projects": "2026-07-02T00:00:00.000Z",
    "explore-resume": "2026-07-03T00:00:00.000Z",
    "explore-contact": "2026-07-04T00:00:00.000Z",
  };

  it("unlocks the grand tour once all four pages are visited", () => {
    const { unlocks, added } = resolveDerivedUnlocks(allTourPages);

    expect(added).toEqual(["explore-grand-tour"]);
    expect(unlocks["explore-grand-tour"]).toBe("2026-07-04T00:00:00.000Z");
  });

  it("does nothing while requirements are incomplete", () => {
    const partial: UnlockedAchievements = {
      "explore-about": "2026-07-01T00:00:00.000Z",
      "explore-projects": "2026-07-02T00:00:00.000Z",
    };

    const { unlocks, added } = resolveDerivedUnlocks(partial);

    expect(added).toEqual([]);
    expect(unlocks).toEqual(partial);
  });

  it("does not re-add an already unlocked derived achievement", () => {
    const { added } = resolveDerivedUnlocks({
      ...allTourPages,
      "explore-grand-tour": "2026-07-04T00:00:00.000Z",
    });

    expect(added).toEqual([]);
  });

  it("resolves chained derived achievements up to completionist", () => {
    const baseUnlocks: UnlockedAchievements = {};

    for (const definition of ACHIEVEMENT_LIST) {
      if (!definition.requiredIds) {
        baseUnlocks[definition.id] = "2026-07-01T00:00:00.000Z";
      }
    }

    const derivedIds = ACHIEVEMENT_LIST.filter((definition) => definition.requiredIds)
      .map((definition) => definition.id)
      .sort();

    const { unlocks, added } = resolveDerivedUnlocks(baseUnlocks);

    expect(derivedIds).toContain("completionist");
    expect([...added].sort()).toEqual(derivedIds);
    expect(getUnlockedIds(unlocks).length).toBe(ACHIEVEMENT_LIST.length);
  });
});

describe("points and levels", () => {
  it("sums points for unlocked ids and ignores unknown ids", () => {
    expect(getTotalPoints(["type-first-run", "meta-sign-up"])).toBe(20);
    expect(getTotalPoints(["type-first-run", "bogus"])).toBe(10);
    expect(getTotalPoints([])).toBe(0);
  });

  it("computes level from points", () => {
    expect(getLevelForPoints(0)).toBe(1);
    expect(getLevelForPoints(POINTS_PER_LEVEL - 1)).toBe(1);
    expect(getLevelForPoints(POINTS_PER_LEVEL)).toBe(2);
    expect(getLevelForPoints(POINTS_PER_LEVEL * 3 + 10)).toBe(4);
  });

  it("reports progress within the current level", () => {
    expect(getLevelProgress(POINTS_PER_LEVEL + 20)).toEqual({
      level: 2,
      current: 20,
      required: POINTS_PER_LEVEL,
    });
  });
});
