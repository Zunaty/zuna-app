import type { Vec2 } from "@/lib/game-canvas/types";

export function wrap(value: number, size: number): number {
  return ((value % size) + size) % size;
}

export function wrapPos(pos: Vec2, width: number, height: number): Vec2 {
  return { x: wrap(pos.x, width), y: wrap(pos.y, height) };
}

/** Shortest signed delta on a wrap-around axis. */
export function wrapDelta(a: number, b: number, size: number): number {
  let delta = a - b;
  const half = size / 2;
  if (delta > half) {
    delta -= size;
  } else if (delta < -half) {
    delta += size;
  }
  return delta;
}

export function circlesOverlapWrapped(
  a: Vec2,
  radiusA: number,
  b: Vec2,
  radiusB: number,
  width: number,
  height: number,
): boolean {
  const dx = wrapDelta(a.x, b.x, width);
  const dy = wrapDelta(a.y, b.y, height);
  const combined = radiusA + radiusB;
  return dx * dx + dy * dy <= combined * combined;
}

export function heading(angle: number): Vec2 {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

export function hypotVec(vel: Vec2): number {
  return Math.hypot(vel.x, vel.y);
}

export function clampSpeed(vel: Vec2, maxSpeed: number): Vec2 {
  const speed = hypotVec(vel);
  if (speed <= maxSpeed || speed === 0) {
    return vel;
  }
  const scale = maxSpeed / speed;
  return { x: vel.x * scale, y: vel.y * scale };
}

export function substepCount(vel: Vec2, dt: number, minRadius: number): number {
  const travel = hypotVec(vel) * dt;
  if (travel <= minRadius || minRadius <= 0) {
    return 1;
  }
  return Math.ceil(travel / minRadius);
}

/**
 * Rotate `vel` toward `target` (world position) without changing speed.
 * `maxTurnRate` is radians/second. Uses wrap-aware direction.
 */
export function steerTowardWrapped(
  pos: Vec2,
  vel: Vec2,
  target: Vec2,
  maxTurnRate: number,
  dt: number,
  width: number,
  height: number,
): Vec2 {
  const speed = hypotVec(vel);
  if (speed === 0) {
    return vel;
  }

  const current = Math.atan2(vel.y, vel.x);
  const desired = Math.atan2(wrapDelta(target.y, pos.y, height), wrapDelta(target.x, pos.x, width));
  let delta = desired - current;
  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }
  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }

  const maxDelta = maxTurnRate * dt;
  const turned = current + Math.max(-maxDelta, Math.min(maxDelta, delta));
  return { x: Math.cos(turned) * speed, y: Math.sin(turned) * speed };
}
