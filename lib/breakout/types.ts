import type { BreakoutMode } from "@/lib/breakout/constants";
import type { BreakoutModifierId } from "@/lib/breakout/modifiers";
import type { Vec2 } from "@/lib/game-canvas/types";

export type BreakoutPhase = "idle" | "serve" | "playing" | "level-clear" | "draft" | "game-over";

export type Ball = {
  id: number;
  pos: Vec2;
  vel: Vec2;
  /** Current speed magnitude, units/second. */
  speed: number;
  /** Resting on the paddle (initial serve or sticky-paddle catch). */
  stuck: boolean;
  /** X offset from paddle center while stuck. */
  stuckOffset: number;
};

export type Brick = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  breakable: boolean;
  points: number;
  row: number;
  /** Blackout curse — bricks render hidden until first hit. */
  revealed: boolean;
};

export type BreakoutState = {
  mode: BreakoutMode;
  phase: BreakoutPhase;
  level: number;
  score: number;
  lives: number;
  /** Paddle x is the center. Width is derived from modifiers each tick. */
  paddle: { x: number; width: number };
  balls: Ball[];
  bricks: Brick[];
  /** Bricks broken since the last paddle touch. */
  volleyCount: number;
  /** Highest volley this run (achievements + results). */
  maxVolley: number;
  /** Piercing already consumed this volley. */
  pierceUsed: boolean;
  modifiers: BreakoutModifierId[];
  /** The 3 offered picks while phase === "draft". */
  draftOptions: BreakoutModifierId[] | null;
  rngState: number;
  /** Seconds remaining on the level-clear interstitial. */
  phaseTimer: number;
  levelsCleared: number;
  livesLostThisLevel: number;
  /** Levels cleared without losing a life (achievements). */
  flawlessLevels: number;
  won: boolean;
  nextBallId: number;
};

export type BreakoutEvent =
  | { type: "launch" }
  | { type: "wall-hit" }
  | { type: "paddle-hit" }
  | { type: "brick-hit"; x: number; y: number }
  | { type: "brick-break"; x: number; y: number; points: number }
  | { type: "life-lost" }
  | { type: "level-clear"; level: number; bonus: number; noMiss: boolean }
  | { type: "draft-open" }
  | { type: "game-over"; won: boolean };

export type BreakoutUpdateResult = {
  state: BreakoutState;
  events: BreakoutEvent[];
};
