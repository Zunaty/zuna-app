import { describe, expect, it } from "vitest";

import { clientXToInternal } from "@/lib/game-canvas/coords";

describe("clientXToInternal", () => {
  it("maps the left and right edges of the canvas", () => {
    expect(clientXToInternal(100, 100, 200, 480)).toBe(0);
    expect(clientXToInternal(300, 100, 200, 480)).toBe(480);
  });

  it("maps the midpoint", () => {
    expect(clientXToInternal(200, 100, 200, 480)).toBe(240);
  });

  it("clamps outside the rect", () => {
    expect(clientXToInternal(50, 100, 200, 480)).toBe(0);
    expect(clientXToInternal(400, 100, 200, 480)).toBe(480);
  });

  it("returns 0 when the rect has no width", () => {
    expect(clientXToInternal(150, 100, 0, 480)).toBe(0);
  });
});
