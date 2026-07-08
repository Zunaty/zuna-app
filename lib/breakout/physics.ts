import { MAX_BOUNCE_ANGLE } from "@/lib/breakout/constants";
import type { Vec2 } from "@/lib/game-canvas/types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Velocity after a paddle bounce. The reflection angle depends on where the
 * ball hit: center = straight up, edges = up to MAX_BOUNCE_ANGLE from vertical.
 */
export function reflectFromPaddle(ballX: number, paddleCenterX: number, paddleWidth: number, speed: number): Vec2 {
  const halfWidth = paddleWidth / 2;
  const offset = clamp((ballX - paddleCenterX) / halfWidth, -1, 1);
  const angle = offset * MAX_BOUNCE_ANGLE;

  return {
    x: Math.sin(angle) * speed,
    y: -Math.cos(angle) * speed,
  };
}

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CircleRectHit = {
  /** Which velocity component to flip. */
  axis: "x" | "y";
  /** Corrected circle center that resolves the overlap. */
  resolvedPos: Vec2;
};

/**
 * Circle-vs-AABB collision. Returns the reflection axis (least penetration)
 * and a resolved position, or null when there is no overlap.
 */
export function collideCircleRect(pos: Vec2, radius: number, rect: Rect): CircleRectHit | null {
  const closestX = clamp(pos.x, rect.x, rect.x + rect.width);
  const closestY = clamp(pos.y, rect.y, rect.y + rect.height);
  const dx = pos.x - closestX;
  const dy = pos.y - closestY;

  if (dx * dx + dy * dy > radius * radius) {
    return null;
  }

  // Penetration depth along each axis, measured from the nearest rect edge.
  const overlapX = radius - Math.abs(dx);
  const overlapY = radius - Math.abs(dy);

  if (dx === 0 && dy === 0) {
    // Center is inside the rect — push out along the shallowest side.
    const leftDist = pos.x - rect.x;
    const rightDist = rect.x + rect.width - pos.x;
    const topDist = pos.y - rect.y;
    const bottomDist = rect.y + rect.height - pos.y;
    const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);

    if (minDist === leftDist) {
      return { axis: "x", resolvedPos: { x: rect.x - radius, y: pos.y } };
    }
    if (minDist === rightDist) {
      return { axis: "x", resolvedPos: { x: rect.x + rect.width + radius, y: pos.y } };
    }
    if (minDist === topDist) {
      return { axis: "y", resolvedPos: { x: pos.x, y: rect.y - radius } };
    }
    return { axis: "y", resolvedPos: { x: pos.x, y: rect.y + rect.height + radius } };
  }

  if (overlapX < overlapY) {
    const sign = dx >= 0 ? 1 : -1;
    return { axis: "x", resolvedPos: { x: pos.x + sign * overlapX, y: pos.y } };
  }

  const sign = dy >= 0 ? 1 : -1;
  return { axis: "y", resolvedPos: { x: pos.x, y: pos.y + sign * overlapY } };
}
