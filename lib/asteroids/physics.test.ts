import { describe, expect, it } from "vitest";

import { FIELD_HEIGHT, FIELD_WIDTH } from "@/lib/asteroids/constants";
import {
  circlesOverlapWrapped,
  clampSpeed,
  steerTowardWrapped,
  substepCount,
  wrap,
  wrapDelta,
  wrapPos,
} from "@/lib/asteroids/physics";

describe("wrap", () => {
  it("wraps past both edges", () => {
    expect(wrap(645, 640)).toBe(5);
    expect(wrap(-5, 640)).toBe(635);
  });
});

describe("wrapPos", () => {
  it("wraps each axis independently", () => {
    expect(wrapPos({ x: 641, y: -2 }, FIELD_WIDTH, FIELD_HEIGHT)).toEqual({ x: 1, y: FIELD_HEIGHT - 2 });
  });
});

describe("wrapDelta", () => {
  it("picks the shorter path across the seam", () => {
    expect(wrapDelta(10, 630, 640)).toBe(20);
    expect(wrapDelta(630, 10, 640)).toBe(-20);
  });
});

describe("circlesOverlapWrapped", () => {
  it("detects a hit across the wrap seam", () => {
    expect(circlesOverlapWrapped({ x: 2, y: 100 }, 8, { x: 638, y: 100 }, 8, FIELD_WIDTH, FIELD_HEIGHT)).toBe(true);
    expect(circlesOverlapWrapped({ x: 200, y: 100 }, 8, { x: 400, y: 100 }, 8, FIELD_WIDTH, FIELD_HEIGHT)).toBe(false);
  });
});

describe("clampSpeed", () => {
  it("leaves slow vectors alone and scales down fast ones", () => {
    expect(clampSpeed({ x: 3, y: 4 }, 10)).toEqual({ x: 3, y: 4 });
    const clamped = clampSpeed({ x: 6, y: 8 }, 5);
    expect(Math.hypot(clamped.x, clamped.y)).toBeCloseTo(5);
  });
});

describe("substepCount", () => {
  it("uses one step when travel fits in the smallest radius", () => {
    expect(substepCount({ x: 10, y: 0 }, 1 / 60, 13)).toBe(1);
  });

  it("splits travel that would tunnel through the smallest radius", () => {
    expect(substepCount({ x: 400, y: 0 }, 1 / 30, 13)).toBeGreaterThan(1);
  });
});

describe("steerTowardWrapped", () => {
  it("turns toward a target without changing speed", () => {
    const vel = steerTowardWrapped({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }, Math.PI, 1 / 60, 640, 480);

    expect(Math.hypot(vel.x, vel.y)).toBeCloseTo(100);
    expect(vel.y).toBeGreaterThan(0);
  });

  it("respects max turn rate", () => {
    const vel = steerTowardWrapped({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }, 0.5, 1 / 60, 640, 480);
    const turned = Math.atan2(vel.y, vel.x);

    expect(turned).toBeCloseTo(0.5 / 60, 5);
  });
});
