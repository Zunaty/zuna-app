import { describe, expect, it } from "vitest";

import { isFpsTarget } from "@/lib/game-canvas/settings";

describe("isFpsTarget", () => {
  it("accepts 30 and 60", () => {
    expect(isFpsTarget(30)).toBe(true);
    expect(isFpsTarget(60)).toBe(true);
  });

  it("rejects other values", () => {
    expect(isFpsTarget(45)).toBe(false);
    expect(isFpsTarget("60")).toBe(false);
    expect(isFpsTarget(null)).toBe(false);
  });
});
