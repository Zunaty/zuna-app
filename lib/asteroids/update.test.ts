import { describe, expect, it } from "vitest";

import {
  BULLET_RADIUS,
  CLASSIC_WAVE_COUNT,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  ROCK_RADIUS,
  STARTING_LIVES,
  WAVE_CLEAR_SECONDS,
} from "@/lib/asteroids/constants";
import type { AsteroidsState, Projectile, Rock } from "@/lib/asteroids/types";
import { createAsteroidsState, shipSpeed, updateAsteroids } from "@/lib/asteroids/update";
import type { GameInput } from "@/lib/game-canvas/types";

const idleInput: GameInput = {
  left: false,
  right: false,
  up: false,
  pointerX: null,
  primaryPressed: false,
  fireHeld: false,
};

const DT = 1 / 60;

function playingState(overrides: Partial<AsteroidsState> = {}): AsteroidsState {
  return { ...createAsteroidsState("classic", 42), ...overrides };
}

function bulletAt(pos: { x: number; y: number }, vel: { x: number; y: number }): Projectile {
  return {
    id: 900,
    pos,
    vel,
    radius: BULLET_RADIUS,
    ttl: 2,
    delivery: "bullet",
    payload: "impact",
    fuse: 0,
    isChild: false,
  };
}

function rockAt(size: Rock["size"], pos: { x: number; y: number }): Rock {
  return {
    id: 1,
    size,
    pos,
    vel: { x: 0, y: 0 },
    radius: ROCK_RADIUS[size],
    angle: 0,
    spin: 0,
    vertices: [],
  };
}

describe("createAsteroidsState", () => {
  it("starts playing wave 1 with a full ship and large rocks", () => {
    const state = createAsteroidsState("classic", 42);

    expect(state.phase).toBe("playing");
    expect(state.wave).toBe(1);
    expect(state.lives).toBe(STARTING_LIVES);
    expect(state.rocks.length).toBe(4);
    expect(state.ship.pos).toEqual({ x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2 });
  });

  it("is deterministic for the same seed", () => {
    const a = createAsteroidsState("classic", 11);
    const b = createAsteroidsState("classic", 11);

    expect(a.rocks).toEqual(b.rocks);
    expect(a.rngState).toBe(b.rngState);
  });
});

describe("ship controls", () => {
  it("rotates while a turn key is held", () => {
    const left = updateAsteroids(playingState(), { ...idleInput, left: true }, DT).state;
    const right = updateAsteroids(playingState(), { ...idleInput, right: true }, DT).state;
    const start = playingState().ship.angle;

    expect(left.ship.angle).toBeLessThan(start);
    expect(right.ship.angle).toBeGreaterThan(start);
  });

  it("gains speed when thrusting", () => {
    const { state } = updateAsteroids(playingState(), { ...idleInput, up: true }, DT);

    expect(shipSpeed(state)).toBeGreaterThan(0);
    expect(state.ship.thrusting).toBe(true);
  });

  it("wraps the ship across the field edge", () => {
    const start = playingState({
      ship: {
        ...playingState().ship,
        pos: { x: FIELD_WIDTH - 2, y: 240 },
        vel: { x: 240, y: 0 },
        iFrames: 2,
      },
    });
    const { state } = updateAsteroids(start, idleInput, DT);

    expect(state.ship.pos.x).toBeLessThan(20);
  });
});

describe("firing", () => {
  it("spawns a projectile at the nose when fire is held", () => {
    const { state, events } = updateAsteroids(playingState(), { ...idleInput, fireHeld: true }, DT);

    expect(state.projectiles).toHaveLength(1);
    expect(events.some((event) => event.type === "fire")).toBe(true);
    expect(state.ship.cooldown).toBeGreaterThan(0);
  });

  it("respects the fire cooldown", () => {
    const first = updateAsteroids(playingState(), { ...idleInput, fireHeld: true }, DT).state;
    const second = updateAsteroids(first, { ...idleInput, fireHeld: true }, DT).state;

    expect(second.projectiles).toHaveLength(1);
  });
});

describe("rocks", () => {
  it("splits a large rock into two medium rocks on hit", () => {
    const start = playingState({
      rocks: [rockAt("large", { x: 200, y: 200 })],
      projectiles: [bulletAt({ x: 200, y: 200 }, { x: 0, y: 0 })],
      ship: { ...playingState().ship, iFrames: 2 },
    });
    const { state, events } = updateAsteroids(start, idleInput, DT);

    expect(state.rocks).toHaveLength(2);
    expect(state.rocks.every((rock) => rock.size === "medium")).toBe(true);
    expect(state.score).toBe(20);
    expect(events.some((event) => event.type === "rock-break" && event.size === "large")).toBe(true);
  });

  it("removes a small rock without fragments", () => {
    const start = playingState({
      rocks: [rockAt("small", { x: 200, y: 200 })],
      projectiles: [bulletAt({ x: 200, y: 200 }, { x: 0, y: 0 })],
      ship: { ...playingState().ship, iFrames: 2 },
    });
    const { state } = updateAsteroids(start, idleInput, DT);

    expect(state.rocks).toHaveLength(0);
    expect(state.score).toBe(100 + 500);
    expect(state.phase).toBe("wave-clear");
  });
});

describe("lives", () => {
  it("costs a life and respawns with i-frames on a rock hit", () => {
    const start = playingState({
      rocks: [rockAt("large", { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2 })],
      ship: { ...playingState().ship, iFrames: 0, pos: { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2 } },
    });
    const { state, events } = updateAsteroids(start, idleInput, DT);

    expect(state.lives).toBe(STARTING_LIVES - 1);
    expect(state.ship.iFrames).toBeGreaterThan(0);
    expect(events.some((event) => event.type === "life-lost")).toBe(true);
  });

  it("ends the run at 0 lives", () => {
    const start = playingState({
      lives: 1,
      rocks: [rockAt("large", { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2 })],
      ship: { ...playingState().ship, iFrames: 0, pos: { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2 } },
    });
    const { state } = updateAsteroids(start, idleInput, DT);

    expect(state.phase).toBe("game-over");
    expect(state.won).toBe(false);
    expect(state.lives).toBe(0);
  });
});

describe("waves", () => {
  it("pays a wave-clear bonus and waits before the next wave", () => {
    const start = playingState({ rocks: [], projectiles: [], score: 0 });
    const { state, events } = updateAsteroids(start, idleInput, DT);

    expect(state.phase).toBe("wave-clear");
    expect(state.score).toBe(500);
    expect(state.wavesCleared).toBe(1);
    expect(events.some((event) => event.type === "wave-clear")).toBe(true);
  });

  it("starts the next wave after the interstitial", () => {
    const cleared = playingState({
      phase: "wave-clear",
      phaseTimer: WAVE_CLEAR_SECONDS,
      rocks: [],
      wave: 1,
    });
    const { state } = updateAsteroids(cleared, idleInput, WAVE_CLEAR_SECONDS + DT);

    expect(state.phase).toBe("playing");
    expect(state.wave).toBe(2);
    expect(state.rocks.length).toBeGreaterThan(0);
  });

  it("wins Classic after the last wave", () => {
    const start = playingState({
      wave: CLASSIC_WAVE_COUNT,
      rocks: [],
      projectiles: [],
      lives: 2,
      score: 0,
    });
    const { state } = updateAsteroids(start, idleInput, DT);

    expect(state.phase).toBe("game-over");
    expect(state.won).toBe(true);
    expect(state.score).toBe(500 * CLASSIC_WAVE_COUNT + 250 * 2);
  });
});
