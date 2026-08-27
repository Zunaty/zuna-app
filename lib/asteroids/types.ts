import type { AsteroidsMode } from "@/lib/asteroids/constants";
import type { AsteroidsModifierId } from "@/lib/asteroids/modifiers";
import type { Vec2 } from "@/lib/game-canvas/types";

export type AsteroidsPhase = "idle" | "playing" | "wave-clear" | "draft" | "buff-choice" | "game-over";

export type Delivery = "bullet" | "thick" | "dumb-missile" | "seeker";
export type Payload = "impact" | "split" | "blast";
export type Formation = "staggered" | "spread";
export type RockSize = "large" | "medium" | "small";

export type Ship = {
  pos: Vec2;
  vel: Vec2;
  angle: number;
  cooldown: number;
  iFrames: number;
  thrusting: boolean;
};

export type Rock = {
  id: number;
  size: RockSize;
  pos: Vec2;
  vel: Vec2;
  radius: number;
  angle: number;
  spin: number;
  vertices: Vec2[];
};

export type Projectile = {
  id: number;
  pos: Vec2;
  vel: Vec2;
  radius: number;
  ttl: number;
  delivery: Delivery;
  payload: Payload;
  fuse: number;
  isChild: boolean;
};

export type Star = {
  id: number;
  pos: Vec2;
  vel: Vec2;
  radius: number;
};

export type Blast = {
  id: number;
  pos: Vec2;
  radius: number;
  ttl: number;
};

export type Pickup = {
  id: number;
  pos: Vec2;
};

export type AsteroidsState = {
  mode: AsteroidsMode;
  phase: AsteroidsPhase;
  wave: number;
  score: number;
  lives: number;
  ship: Ship;
  rocks: Rock[];
  stars: Star[];
  projectiles: Projectile[];
  blasts: Blast[];
  pickups: Pickup[];
  multiShot: { remaining: number; formation: Formation } | null;
  modifiers: AsteroidsModifierId[];
  draftOptions: AsteroidsModifierId[] | null;
  seed: number;
  rngState: number;
  phaseTimer: number;
  wavesCleared: number;
  won: boolean;
  nextId: number;
};

export type AsteroidsEvent =
  | { type: "fire" }
  | { type: "rock-break"; size: RockSize; x: number; y: number; points: number }
  | { type: "life-lost" }
  | { type: "wave-clear"; wave: number; bonus: number }
  | { type: "game-over"; won: boolean };

export type AsteroidsUpdateResult = {
  state: AsteroidsState;
  events: AsteroidsEvent[];
};
