import {
  FIELD_HEIGHT,
  FIELD_WIDTH,
  ROCK_RADIUS,
  ROCK_SHAPE_VERTICES,
  ROCK_SPEED,
  ROCK_SPLIT_COUNT,
  ROCK_SPLIT_KICK,
  SAFE_SPAWN_RADIUS,
  WAVE_BASE_LARGE,
  WAVE_LARGE_CAP,
  WAVE_LARGE_PER_WAVE,
  WAVE_SPEED_RAMP,
} from "@/lib/asteroids/constants";
import { heading, wrapDelta, wrapPos } from "@/lib/asteroids/physics";
import { nextRandom } from "@/lib/asteroids/rng";
import type { Rock, RockSize } from "@/lib/asteroids/types";
import type { Vec2 } from "@/lib/game-canvas/types";

export function waveLargeCount(wave: number, rockCountMult: number): number {
  const base = Math.min(WAVE_LARGE_CAP, WAVE_BASE_LARGE + WAVE_LARGE_PER_WAVE * (wave - 1));
  return Math.max(1, Math.round(base * rockCountMult));
}

export function waveSpeedMult(wave: number): number {
  return 1 + WAVE_SPEED_RAMP * (wave - 1);
}

export function nextSize(size: RockSize): RockSize | null {
  if (size === "large") {
    return "medium";
  }
  if (size === "medium") {
    return "small";
  }
  return null;
}

function createRockShape(radius: number, rngState: number): { vertices: Vec2[]; rngState: number } {
  const vertices: Vec2[] = [];
  let rng = rngState;

  for (let i = 0; i < ROCK_SHAPE_VERTICES; i += 1) {
    const jitter = nextRandom(rng);
    rng = jitter.next;
    const angle = (i / ROCK_SHAPE_VERTICES) * Math.PI * 2;
    const dist = radius * (0.72 + jitter.value * 0.36);
    vertices.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
  }

  return { vertices, rngState: rng };
}

export function createRock(
  id: number,
  size: RockSize,
  pos: Vec2,
  vel: Vec2,
  rngState: number,
): { rock: Rock; rngState: number } {
  const radius = ROCK_RADIUS[size];
  const shape = createRockShape(radius, rngState);
  const spinRoll = nextRandom(shape.rngState);
  const spin = (spinRoll.value - 0.5) * 1.4;

  return {
    rock: {
      id,
      size,
      pos,
      vel,
      radius,
      angle: 0,
      spin,
      vertices: shape.vertices,
    },
    rngState: spinRoll.next,
  };
}

function spawnAwayFromShip(shipPos: Vec2, rngState: number): { pos: Vec2; rngState: number } {
  let rng = rngState;
  let pos = shipPos;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const angleRoll = nextRandom(rng);
    rng = angleRoll.next;
    const distRoll = nextRandom(rng);
    rng = distRoll.next;

    const angle = angleRoll.value * Math.PI * 2;
    const dist = SAFE_SPAWN_RADIUS + distRoll.value * Math.min(FIELD_WIDTH, FIELD_HEIGHT) * 0.35;
    pos = wrapPos(
      { x: shipPos.x + Math.cos(angle) * dist, y: shipPos.y + Math.sin(angle) * dist },
      FIELD_WIDTH,
      FIELD_HEIGHT,
    );

    const dx = wrapDelta(pos.x, shipPos.x, FIELD_WIDTH);
    const dy = wrapDelta(pos.y, shipPos.y, FIELD_HEIGHT);
    if (dx * dx + dy * dy >= SAFE_SPAWN_RADIUS * SAFE_SPAWN_RADIUS) {
      break;
    }
  }

  return { pos, rngState: rng };
}

export function spawnWaveRocks(
  wave: number,
  shipPos: Vec2,
  nextId: number,
  rngState: number,
  rockCountMult: number,
): { rocks: Rock[]; nextId: number; rngState: number } {
  const count = waveLargeCount(wave, rockCountMult);
  const speedMult = waveSpeedMult(wave);
  const rocks: Rock[] = [];
  let rng = rngState;
  let id = nextId;

  for (let i = 0; i < count; i += 1) {
    const placed = spawnAwayFromShip(shipPos, rng);
    rng = placed.rngState;
    const headingRoll = nextRandom(rng);
    rng = headingRoll.next;
    const speedRoll = nextRandom(rng);
    rng = speedRoll.next;

    const dir = heading(headingRoll.value * Math.PI * 2);
    const speed = ROCK_SPEED.large * speedMult * (0.7 + speedRoll.value * 0.6);
    const created = createRock(id, "large", placed.pos, { x: dir.x * speed, y: dir.y * speed }, rng);
    rocks.push(created.rock);
    rng = created.rngState;
    id += 1;
  }

  return { rocks, nextId: id, rngState: rng };
}

export function splitRock(
  rock: Rock,
  nextId: number,
  rngState: number,
): { fragments: Rock[]; nextId: number; rngState: number } {
  const childSize = nextSize(rock.size);
  if (!childSize) {
    return { fragments: [], nextId, rngState };
  }

  const fragments: Rock[] = [];
  let rng = rngState;
  let id = nextId;
  const baseAngleRoll = nextRandom(rng);
  rng = baseAngleRoll.next;
  const baseAngle = baseAngleRoll.value * Math.PI * 2;

  for (let i = 0; i < ROCK_SPLIT_COUNT; i += 1) {
    const jitter = nextRandom(rng);
    rng = jitter.next;
    const angle = baseAngle + (i * Math.PI * 2) / ROCK_SPLIT_COUNT + (jitter.value - 0.5) * 0.4;
    const kick = heading(angle);
    const vel = {
      x: rock.vel.x + kick.x * ROCK_SPLIT_KICK,
      y: rock.vel.y + kick.y * ROCK_SPLIT_KICK,
    };
    const created = createRock(id, childSize, { ...rock.pos }, vel, rng);
    fragments.push(created.rock);
    rng = created.rngState;
    id += 1;
  }

  return { fragments, nextId: id, rngState: rng };
}
