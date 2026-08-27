import {
  CLASSIC_WAVE_COUNT,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  MIN_COLLISION_RADIUS,
  SHIP_DRAG,
  SHIP_IFRAMES,
  SHIP_MAX_SPEED,
  SHIP_RADIUS,
  SHIP_ROTATE_SPEED,
  STARTING_LIVES,
  WAVE_CLEAR_SECONDS,
  type AsteroidsMode,
} from "@/lib/asteroids/constants";
import { deriveRunConfig, type AsteroidsRunConfig } from "@/lib/asteroids/modifiers";
import { circlesOverlapWrapped, clampSpeed, heading, hypotVec, substepCount, wrapPos } from "@/lib/asteroids/physics";
import { canFire, spawnProjectile } from "@/lib/asteroids/projectiles";
import { livesBonus, rockPoints, waveClearBonus } from "@/lib/asteroids/scoring";
import type {
  AsteroidsEvent,
  AsteroidsState,
  AsteroidsUpdateResult,
  Projectile,
  Rock,
  Ship,
} from "@/lib/asteroids/types";
import { spawnWaveRocks, splitRock } from "@/lib/asteroids/waves";
import type { GameInput } from "@/lib/game-canvas/types";

function centeredShip(): Ship {
  return {
    pos: { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2 },
    vel: { x: 0, y: 0 },
    angle: -Math.PI / 2,
    cooldown: 0,
    iFrames: SHIP_IFRAMES,
    thrusting: false,
  };
}

export function createAsteroidsState(mode: AsteroidsMode, seed: number): AsteroidsState {
  const ship = centeredShip();
  const spawned = spawnWaveRocks(1, ship.pos, 1, seed | 0, deriveRunConfig([]).rockCountMult);

  return {
    mode,
    phase: "playing",
    wave: 1,
    score: 0,
    lives: STARTING_LIVES,
    ship,
    rocks: spawned.rocks,
    stars: [],
    projectiles: [],
    blasts: [],
    pickups: [],
    multiShot: null,
    modifiers: [],
    draftOptions: null,
    seed: seed | 0,
    rngState: spawned.rngState,
    phaseTimer: 0,
    wavesCleared: 0,
    won: false,
    nextId: spawned.nextId,
  };
}

function stepShip(
  state: AsteroidsState,
  input: GameInput,
  dt: number,
  config: AsteroidsRunConfig,
  events: AsteroidsEvent[],
): AsteroidsState {
  let { angle, vel, pos, cooldown, iFrames } = state.ship;

  if (input.left !== input.right) {
    const dir = input.left ? -1 : 1;
    angle += dir * SHIP_ROTATE_SPEED * dt;
  }

  if (input.up) {
    const nose = heading(angle);
    vel = { x: vel.x + nose.x * config.thrust * dt, y: vel.y + nose.y * config.thrust * dt };
  }

  const drag = Math.exp(-SHIP_DRAG * dt);
  vel = clampSpeed({ x: vel.x * drag, y: vel.y * drag }, SHIP_MAX_SPEED);
  pos = wrapPos({ x: pos.x + vel.x * dt, y: pos.y + vel.y * dt }, FIELD_WIDTH, FIELD_HEIGHT);
  cooldown = Math.max(0, cooldown - dt);
  iFrames = Math.max(0, iFrames - dt);

  let projectiles = state.projectiles;
  let nextId = state.nextId;
  let shipCooldown = cooldown;

  if (input.fireHeld && canFire({ ...state.ship, cooldown: shipCooldown }, projectiles.length)) {
    projectiles = [...projectiles, spawnProjectile({ ...state.ship, pos, vel, angle }, nextId, config)];
    nextId += 1;
    shipCooldown = 1 / config.fireRate;
    events.push({ type: "fire" });
  }

  return {
    ...state,
    nextId,
    projectiles,
    ship: {
      pos,
      vel,
      angle,
      cooldown: shipCooldown,
      iFrames,
      thrusting: input.up,
    },
  };
}

function stepRocks(rocks: Rock[], dt: number): Rock[] {
  return rocks.map((rock) => ({
    ...rock,
    pos: wrapPos({ x: rock.pos.x + rock.vel.x * dt, y: rock.pos.y + rock.vel.y * dt }, FIELD_WIDTH, FIELD_HEIGHT),
    angle: rock.angle + rock.spin * dt,
  }));
}

function moveProjectile(projectile: Projectile, dt: number): Projectile {
  return {
    ...projectile,
    pos: wrapPos(
      { x: projectile.pos.x + projectile.vel.x * dt, y: projectile.pos.y + projectile.vel.y * dt },
      FIELD_WIDTH,
      FIELD_HEIGHT,
    ),
    ttl: projectile.ttl - dt,
  };
}

function breakRock(
  state: AsteroidsState,
  rock: Rock,
  events: AsteroidsEvent[],
  config: AsteroidsRunConfig,
): AsteroidsState {
  const points = rockPoints(rock.size, config.scoreMult);
  events.push({ type: "rock-break", size: rock.size, x: rock.pos.x, y: rock.pos.y, points });

  const split = splitRock(rock, state.nextId, state.rngState);
  return {
    ...state,
    score: state.score + points,
    rocks: [...state.rocks.filter((candidate) => candidate.id !== rock.id), ...split.fragments],
    nextId: split.nextId,
    rngState: split.rngState,
  };
}

function collideProjectiles(
  state: AsteroidsState,
  dt: number,
  config: AsteroidsRunConfig,
  events: AsteroidsEvent[],
): AsteroidsState {
  const survivors: Projectile[] = [];
  let next = state;

  for (const projectile of state.projectiles) {
    const steps = substepCount(projectile.vel, dt, MIN_COLLISION_RADIUS);
    const subDt = dt / steps;
    let current = projectile;
    let alive = true;

    for (let step = 0; step < steps; step += 1) {
      current = moveProjectile(current, subDt);
      if (current.ttl <= 0) {
        alive = false;
        break;
      }

      const hit = next.rocks.find((rock) =>
        circlesOverlapWrapped(current.pos, current.radius, rock.pos, rock.radius, FIELD_WIDTH, FIELD_HEIGHT),
      );

      if (hit) {
        next = breakRock(next, hit, events, config);
        alive = false;
        break;
      }
    }

    if (alive && current.ttl > 0) {
      survivors.push(current);
    }
  }

  return { ...next, projectiles: survivors };
}

function hitShip(state: AsteroidsState, events: AsteroidsEvent[]): AsteroidsState {
  const lives = state.lives - 1;
  events.push({ type: "life-lost" });

  if (lives <= 0) {
    events.push({ type: "game-over", won: false });
    return {
      ...state,
      lives: 0,
      phase: "game-over",
      won: false,
      ship: { ...state.ship, thrusting: false, iFrames: 0 },
    };
  }

  return {
    ...state,
    lives,
    ship: { ...centeredShip(), angle: state.ship.angle },
    projectiles: [],
  };
}

function collideShip(state: AsteroidsState, events: AsteroidsEvent[]): AsteroidsState {
  if (state.phase !== "playing" || state.ship.iFrames > 0) {
    return state;
  }

  const hit = state.rocks.some((rock) =>
    circlesOverlapWrapped(state.ship.pos, SHIP_RADIUS, rock.pos, rock.radius, FIELD_WIDTH, FIELD_HEIGHT),
  );

  return hit ? hitShip(state, events) : state;
}

function clearWave(state: AsteroidsState, config: AsteroidsRunConfig, events: AsteroidsEvent[]): AsteroidsState {
  const bonus = waveClearBonus(state.wave, config.scoreMult);
  const wavesCleared = state.wavesCleared + 1;
  events.push({ type: "wave-clear", wave: state.wave, bonus });

  const classicWin = state.mode === "classic" && state.wave >= CLASSIC_WAVE_COUNT;
  if (classicWin) {
    const endBonus = livesBonus(state.lives);
    events.push({ type: "game-over", won: true });
    return {
      ...state,
      score: state.score + bonus + endBonus,
      wavesCleared,
      phase: "game-over",
      won: true,
      ship: { ...state.ship, thrusting: false },
    };
  }

  return {
    ...state,
    score: state.score + bonus,
    wavesCleared,
    phase: "wave-clear",
    phaseTimer: WAVE_CLEAR_SECONDS,
    projectiles: [],
  };
}

function beginNextWave(state: AsteroidsState): AsteroidsState {
  const wave = state.wave + 1;
  const config = deriveRunConfig(state.modifiers);
  const spawned = spawnWaveRocks(wave, state.ship.pos, state.nextId, state.rngState, config.rockCountMult);

  return {
    ...state,
    wave,
    phase: "playing",
    phaseTimer: 0,
    rocks: spawned.rocks,
    stars: [],
    projectiles: [],
    rngState: spawned.rngState,
    nextId: spawned.nextId,
    ship: { ...state.ship, iFrames: SHIP_IFRAMES * 0.5 },
  };
}

export function updateAsteroids(state: AsteroidsState, input: GameInput, dt: number): AsteroidsUpdateResult {
  if (
    state.phase === "game-over" ||
    state.phase === "idle" ||
    state.phase === "draft" ||
    state.phase === "buff-choice"
  ) {
    return { state, events: [] };
  }

  if (state.phase === "wave-clear") {
    const timer = state.phaseTimer - dt;
    if (timer > 0) {
      return { state: { ...state, phaseTimer: timer }, events: [] };
    }
    return { state: beginNextWave(state), events: [] };
  }

  const config = deriveRunConfig(state.modifiers);
  const events: AsteroidsEvent[] = [];

  let next = stepShip(state, input, dt, config, events);
  next = { ...next, rocks: stepRocks(next.rocks, dt) };
  next = collideProjectiles(next, dt, config, events);
  next = collideShip(next, events);

  if (next.phase === "playing" && next.rocks.length === 0) {
    next = clearWave(next, config, events);
  }

  return { state: next, events };
}

/** Exposed for tests that need to inspect travel after a known thrust. */
export function shipSpeed(state: AsteroidsState): number {
  return hypotVec(state.ship.vel);
}
