import {
  BALL_BASE_SPEED,
  BALL_HIT_RAMP,
  BALL_HIT_RAMP_CAP,
  BALL_LEVEL_SPEED_RAMP,
  BALL_MAX_SPEED,
  BALL_RADIUS,
  CLASSIC_LEVEL_COUNT,
  DRAFT_SKIP_BONUS,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  LEVEL_CLEAR_SECONDS,
  MAX_LAUNCH_ANGLE,
  PADDLE_HEIGHT,
  PADDLE_SPEED,
  PADDLE_Y,
  STARTING_LIVES,
  type BreakoutMode,
} from "@/lib/breakout/constants";
import { createBricks, loopHpBonus, pickLayoutIndex } from "@/lib/breakout/levels";
import {
  deriveRunConfig,
  drawDraftOptions,
  type BreakoutModifierId,
  type BreakoutRunConfig,
} from "@/lib/breakout/modifiers";
import { clamp, collideCircleRect, reflectFromPaddle } from "@/lib/breakout/physics";
import { brickPoints, levelClearBonus, livesBonus } from "@/lib/breakout/scoring";
import type { Ball, BreakoutEvent, BreakoutState, BreakoutUpdateResult, Brick } from "@/lib/breakout/types";
import type { GameInput } from "@/lib/game-canvas/types";

/** Base ball speed for a level, before modifier multipliers. */
export function levelBallSpeed(level: number, config: BreakoutRunConfig): number {
  return Math.min(BALL_MAX_SPEED, BALL_BASE_SPEED * (1 + BALL_LEVEL_SPEED_RAMP * (level - 1)) * config.ballSpeedMult);
}

function speedCap(level: number, config: BreakoutRunConfig): number {
  return Math.min(BALL_MAX_SPEED, levelBallSpeed(level, config) * BALL_HIT_RAMP_CAP);
}

function createServeBalls(state: BreakoutState, config: BreakoutRunConfig): { balls: Ball[]; nextBallId: number } {
  const balls: Ball[] = [];
  const speed = levelBallSpeed(state.level, config);
  let nextBallId = state.nextBallId;

  for (let i = 0; i < config.ballCount; i += 1) {
    const stuckOffset = (i - (config.ballCount - 1) / 2) * 18;
    balls.push({
      id: nextBallId++,
      pos: { x: state.paddle.x + stuckOffset, y: PADDLE_Y - BALL_RADIUS },
      vel: { x: 0, y: 0 },
      speed,
      stuck: true,
      stuckOffset,
    });
  }

  return { balls, nextBallId };
}

function buildLevel(state: BreakoutState, config: BreakoutRunConfig): BreakoutState {
  const layout = pickLayoutIndex(state.mode, state.level, state.rngState);
  const hpBonus = loopHpBonus(state.mode, state.level) + config.brickHpBonus;
  const bricks = createBricks(layout.index, hpBonus, config.blackout);

  const withPaddle: BreakoutState = {
    ...state,
    rngState: layout.rngState,
    bricks,
    paddle: { ...state.paddle, width: config.paddleWidth },
    volleyCount: 0,
    pierceUsed: false,
    livesLostThisLevel: 0,
    phase: "serve",
    draftOptions: null,
  };

  const serve = createServeBalls(withPaddle, config);
  return { ...withPaddle, balls: serve.balls, nextBallId: serve.nextBallId };
}

export function createBreakoutState(mode: BreakoutMode, seed: number): BreakoutState {
  const base: BreakoutState = {
    mode,
    phase: "idle",
    level: 1,
    score: 0,
    lives: STARTING_LIVES,
    paddle: { x: FIELD_WIDTH / 2, width: deriveRunConfig([]).paddleWidth },
    balls: [],
    bricks: [],
    volleyCount: 0,
    maxVolley: 0,
    pierceUsed: false,
    modifiers: [],
    draftOptions: null,
    rngState: seed | 0,
    phaseTimer: 0,
    levelsCleared: 0,
    livesLostThisLevel: 0,
    flawlessLevels: 0,
    won: false,
    nextBallId: 1,
  };

  return buildLevel(base, deriveRunConfig([]));
}

function launchBall(ball: Ball, paddleWidth: number): Ball {
  const halfWidth = paddleWidth / 2;
  const offsetRatio = clamp(ball.stuckOffset / halfWidth, -1, 1);
  const angle = offsetRatio * MAX_LAUNCH_ANGLE;

  return {
    ...ball,
    stuck: false,
    vel: {
      x: Math.sin(angle) * ball.speed,
      y: -Math.cos(angle) * ball.speed,
    },
  };
}

/** Player picked a draft option (or skipped). Roguelite only. */
export function applyDraftPick(state: BreakoutState, pick: BreakoutModifierId | "skip"): BreakoutState {
  if (state.phase !== "draft") {
    return state;
  }

  let next: BreakoutState = { ...state, level: state.level + 1 };

  if (pick === "skip") {
    next = { ...next, score: next.score + DRAFT_SKIP_BONUS };
  } else {
    next = { ...next, modifiers: [...next.modifiers, pick] };
    if (pick === "extra-life") {
      next = { ...next, lives: next.lives + 1 };
    }
  }

  return buildLevel(next, deriveRunConfig(next.modifiers));
}

function movePaddle(state: BreakoutState, input: GameInput, dt: number, config: BreakoutRunConfig): BreakoutState {
  const halfWidth = config.paddleWidth / 2;
  let x = state.paddle.x;

  if (input.pointerX !== null) {
    x = input.pointerX;
  } else if (input.left !== input.right) {
    x += (input.right ? 1 : -1) * PADDLE_SPEED * dt;
  }

  x = clamp(x, halfWidth, FIELD_WIDTH - halfWidth);

  const paddle = { x, width: config.paddleWidth };
  const balls = state.balls.map((ball) =>
    ball.stuck ? { ...ball, pos: { x: x + ball.stuckOffset, y: PADDLE_Y - BALL_RADIUS } } : ball,
  );

  return { ...state, paddle, balls };
}

type BallStepResult = {
  ball: Ball | null;
  bricks: Brick[];
  score: number;
  volleyCount: number;
  maxVolley: number;
  pierceUsed: boolean;
  events: BreakoutEvent[];
};

function stepBall(
  ball: Ball,
  state: BreakoutState,
  config: BreakoutRunConfig,
  dt: number,
  bricksIn: Brick[],
): BallStepResult {
  const events: BreakoutEvent[] = [];
  let bricks = bricksIn;
  let score = state.score;
  let volleyCount = state.volleyCount;
  let maxVolley = state.maxVolley;
  let pierceUsed = state.pierceUsed;

  let pos = { ...ball.pos };
  let vel = { ...ball.vel };
  let speed = ball.speed;

  // Substep so fast balls can't tunnel through bricks (matters most at 30 fps).
  const travel = speed * dt;
  const substeps = Math.max(1, Math.ceil(travel / BALL_RADIUS));
  const subDt = dt / substeps;

  for (let step = 0; step < substeps; step += 1) {
    pos = { x: pos.x + vel.x * subDt, y: pos.y + vel.y * subDt };

    // Walls
    if (pos.x - BALL_RADIUS < 0) {
      pos.x = BALL_RADIUS;
      vel.x = Math.abs(vel.x);
      events.push({ type: "wall-hit" });
    } else if (pos.x + BALL_RADIUS > FIELD_WIDTH) {
      pos.x = FIELD_WIDTH - BALL_RADIUS;
      vel.x = -Math.abs(vel.x);
      events.push({ type: "wall-hit" });
    }

    if (pos.y - BALL_RADIUS < 0) {
      pos.y = BALL_RADIUS;
      vel.y = Math.abs(vel.y);
      events.push({ type: "wall-hit" });
    }

    // Paddle
    if (vel.y > 0) {
      const paddleRect = {
        x: state.paddle.x - state.paddle.width / 2,
        y: PADDLE_Y,
        width: state.paddle.width,
        height: PADDLE_HEIGHT,
      };
      const paddleHit = collideCircleRect(pos, BALL_RADIUS, paddleRect);

      if (paddleHit) {
        if (config.sticky) {
          const stuckOffset = clamp(pos.x - state.paddle.x, -state.paddle.width / 2, state.paddle.width / 2);
          events.push({ type: "paddle-hit" });
          return {
            ball: {
              ...ball,
              pos: { x: state.paddle.x + stuckOffset, y: PADDLE_Y - BALL_RADIUS },
              vel: { x: 0, y: 0 },
              speed,
              stuck: true,
              stuckOffset,
            },
            bricks,
            score,
            volleyCount: config.comboKeeper ? Math.floor(volleyCount / 2) : 0,
            maxVolley,
            pierceUsed: false,
            events,
          };
        }

        speed = Math.min(speedCap(state.level, config), speed * BALL_HIT_RAMP);
        vel = reflectFromPaddle(pos.x, state.paddle.x, state.paddle.width, speed);
        pos.y = PADDLE_Y - BALL_RADIUS;
        volleyCount = config.comboKeeper ? Math.floor(volleyCount / 2) : 0;
        pierceUsed = false;
        events.push({ type: "paddle-hit" });
      }
    }

    // Bricks — resolve at most one brick hit per substep.
    for (let i = 0; i < bricks.length; i += 1) {
      const brick = bricks[i];
      const hit = collideCircleRect(pos, BALL_RADIUS, brick);
      if (!hit) {
        continue;
      }

      const centerX = brick.x + brick.width / 2;
      const centerY = brick.y + brick.height / 2;

      if (!brick.breakable || brick.hp > 1) {
        // Survives the hit — always bounce.
        const updated: Brick = brick.breakable
          ? { ...brick, hp: brick.hp - 1, revealed: true }
          : { ...brick, revealed: true };
        bricks = bricks.map((b, index) => (index === i ? updated : b));
        pos = hit.resolvedPos;
        if (hit.axis === "x") {
          vel.x = -vel.x;
        } else {
          vel.y = -vel.y;
        }
        events.push({ type: "brick-hit", x: centerX, y: centerY });
      } else {
        // Breaks.
        const points = brickPoints(brick.points, volleyCount, config.scoreMult);
        score += points;
        volleyCount += 1;
        maxVolley = Math.max(maxVolley, volleyCount);
        bricks = bricks.filter((_, index) => index !== i);
        events.push({ type: "brick-break", x: centerX, y: centerY, points });

        const canPierce = config.piercing && !pierceUsed;
        if (canPierce) {
          pierceUsed = true;
          // No bounce — the ball carries through.
        } else {
          pos = hit.resolvedPos;
          if (hit.axis === "x") {
            vel.x = -vel.x;
          } else {
            vel.y = -vel.y;
          }
        }
      }

      break;
    }

    // Fell below the field
    if (pos.y - BALL_RADIUS > FIELD_HEIGHT) {
      return { ball: null, bricks, score, volleyCount, maxVolley, pierceUsed, events };
    }
  }

  return {
    ball: { ...ball, pos, vel, speed },
    bricks,
    score,
    volleyCount,
    maxVolley,
    pierceUsed,
    events,
  };
}

export function updateBreakout(state: BreakoutState, input: GameInput, dt: number): BreakoutUpdateResult {
  const events: BreakoutEvent[] = [];
  const config = deriveRunConfig(state.modifiers);

  if (state.phase === "level-clear") {
    const phaseTimer = state.phaseTimer - dt;
    if (phaseTimer > 0) {
      return { state: { ...state, phaseTimer }, events };
    }

    if (state.mode === "classic") {
      if (state.level >= CLASSIC_LEVEL_COUNT) {
        const bonus = livesBonus(state.lives);
        events.push({ type: "game-over", won: true });
        return {
          state: { ...state, phaseTimer: 0, phase: "game-over", won: true, score: state.score + bonus },
          events,
        };
      }

      const next = buildLevel({ ...state, phaseTimer: 0, level: state.level + 1 }, config);
      return { state: next, events };
    }

    const draft = drawDraftOptions(state.modifiers, state.rngState);
    events.push({ type: "draft-open" });
    return {
      state: { ...state, phaseTimer: 0, phase: "draft", draftOptions: draft.options, rngState: draft.rngState },
      events,
    };
  }

  if (state.phase !== "serve" && state.phase !== "playing") {
    return { state, events };
  }

  let next = movePaddle(state, input, dt, config);

  // Serve / sticky release
  if (input.primaryPressed && next.balls.some((ball) => ball.stuck)) {
    next = {
      ...next,
      phase: "playing",
      balls: next.balls.map((ball) => (ball.stuck ? launchBall(ball, next.paddle.width) : ball)),
    };
    events.push({ type: "launch" });
  }

  if (next.phase !== "playing") {
    return { state: next, events };
  }

  // Step each ball against the shared brick field.
  let bricks = next.bricks;
  let score = next.score;
  let volleyCount = next.volleyCount;
  let maxVolley = next.maxVolley;
  let pierceUsed = next.pierceUsed;
  const survivors: Ball[] = [];

  for (const ball of next.balls) {
    if (ball.stuck) {
      survivors.push(ball);
      continue;
    }

    const result = stepBall(ball, { ...next, bricks, score, volleyCount, maxVolley, pierceUsed }, config, dt, bricks);
    bricks = result.bricks;
    score = result.score;
    volleyCount = result.volleyCount;
    maxVolley = result.maxVolley;
    pierceUsed = result.pierceUsed;
    events.push(...result.events);

    if (result.ball) {
      survivors.push(result.ball);
    }
  }

  next = { ...next, balls: survivors, bricks, score, volleyCount, maxVolley, pierceUsed };

  // Level clear?
  if (!next.bricks.some((brick) => brick.breakable)) {
    const bonus = levelClearBonus(next.level, config.scoreMult);
    const noMiss = next.livesLostThisLevel === 0;
    events.push({ type: "level-clear", level: next.level, bonus, noMiss });

    return {
      state: {
        ...next,
        score: next.score + bonus,
        levelsCleared: next.levelsCleared + 1,
        flawlessLevels: noMiss ? next.flawlessLevels + 1 : next.flawlessLevels,
        phase: "level-clear",
        phaseTimer: LEVEL_CLEAR_SECONDS,
        balls: [],
      },
      events,
    };
  }

  // All balls lost?
  if (next.balls.length === 0) {
    events.push({ type: "life-lost" });
    const lives = next.lives - 1;

    if (lives <= 0) {
      events.push({ type: "game-over", won: false });
      return {
        state: { ...next, lives: 0, phase: "game-over", won: false },
        events,
      };
    }

    const serve = createServeBalls({ ...next, lives }, config);
    return {
      state: {
        ...next,
        lives,
        livesLostThisLevel: next.livesLostThisLevel + 1,
        balls: serve.balls,
        nextBallId: serve.nextBallId,
        volleyCount: 0,
        pierceUsed: false,
        phase: "serve",
      },
      events,
    };
  }

  return { state: next, events };
}
