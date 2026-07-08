import { describe, expect, it } from "vitest";

import { collideCircleRect, reflectFromPaddle } from "@/lib/breakout/physics";

describe("reflectFromPaddle", () => {
  it("sends a center hit straight up", () => {
    const vel = reflectFromPaddle(240, 240, 80, 300);

    expect(vel.x).toBeCloseTo(0);
    expect(vel.y).toBeCloseTo(-300);
  });

  it("angles edge hits away from vertical", () => {
    const rightEdge = reflectFromPaddle(280, 240, 80, 300);
    const leftEdge = reflectFromPaddle(200, 240, 80, 300);

    expect(rightEdge.x).toBeGreaterThan(0);
    expect(leftEdge.x).toBeLessThan(0);
    expect(rightEdge.y).toBeLessThan(0);
    expect(leftEdge.y).toBeLessThan(0);
  });

  it("clamps hits beyond the paddle edge to the max angle", () => {
    const beyond = reflectFromPaddle(500, 240, 80, 300);
    const atEdge = reflectFromPaddle(280, 240, 80, 300);

    expect(beyond.x).toBeCloseTo(atEdge.x);
    expect(beyond.y).toBeCloseTo(atEdge.y);
  });

  it("preserves speed magnitude", () => {
    const vel = reflectFromPaddle(270, 240, 80, 300);
    const magnitude = Math.hypot(vel.x, vel.y);

    expect(magnitude).toBeCloseTo(300);
  });
});

describe("collideCircleRect", () => {
  const rect = { x: 100, y: 100, width: 44, height: 18 };

  it("returns null when there is no overlap", () => {
    expect(collideCircleRect({ x: 50, y: 50 }, 6, rect)).toBeNull();
    expect(collideCircleRect({ x: 122, y: 130 }, 6, rect)).toBeNull();
  });

  it("reflects on the y axis when hitting the flat top of a brick", () => {
    const hit = collideCircleRect({ x: 122, y: 96 }, 6, rect);

    expect(hit).not.toBeNull();
    expect(hit?.axis).toBe("y");
    expect(hit?.resolvedPos.y).toBeLessThan(100);
  });

  it("reflects on the x axis when hitting the side of a brick", () => {
    const hit = collideCircleRect({ x: 97, y: 109 }, 6, rect);

    expect(hit).not.toBeNull();
    expect(hit?.axis).toBe("x");
    expect(hit?.resolvedPos.x).toBeLessThan(100);
  });

  it("pushes out along the shallowest side when the center is inside", () => {
    const hit = collideCircleRect({ x: 122, y: 102 }, 6, rect);

    expect(hit).not.toBeNull();
    expect(hit?.axis).toBe("y");
  });
});
