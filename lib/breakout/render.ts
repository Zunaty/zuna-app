import {
  BALL_RADIUS,
  BRICK_ROW_HEIGHT,
  BRICK_TOP_OFFSET,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_Y,
} from "@/lib/breakout/constants";
import type { JuiceState } from "@/lib/breakout/juice";
import type { BreakoutState, Brick } from "@/lib/breakout/types";

/** Retro row palette — fixed colors so the field reads the same in both themes. */
const ROW_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];
const UNBREAKABLE_COLOR = "#475569";
const PADDLE_COLOR = "#e2e8f0";
const BALL_COLOR = "#f8fafc";
const BACKGROUND_COLOR = "#0b1020";

export function brickColor(brick: Brick): string {
  if (!brick.breakable) {
    return UNBREAKABLE_COLOR;
  }
  return ROW_COLORS[brick.row % ROW_COLORS.length];
}

/** Approximate row color from a field y coordinate (for particle bursts). */
export function rowColorForY(y: number): string {
  const row = Math.max(0, Math.floor((y - BRICK_TOP_OFFSET) / BRICK_ROW_HEIGHT));
  return ROW_COLORS[row % ROW_COLORS.length];
}

type RenderOptions = {
  reducedMotion: boolean;
};

export function renderBreakout(
  ctx: CanvasRenderingContext2D,
  state: BreakoutState,
  juice: JuiceState,
  options: RenderOptions,
): void {
  ctx.save();

  // Screen shake
  if (!options.reducedMotion && juice.shake > 0.1) {
    const dx = (Math.random() - 0.5) * juice.shake * 2;
    const dy = (Math.random() - 0.5) * juice.shake * 2;
    ctx.translate(dx, dy);
  }

  // Field
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(-8, -8, FIELD_WIDTH + 16, FIELD_HEIGHT + 16);

  // Bricks
  for (const brick of state.bricks) {
    if (!brick.revealed) {
      // Blackout curse — a whisper of an outline so the field isn't a void.
      ctx.strokeStyle = "rgba(148, 163, 184, 0.07)";
      ctx.strokeRect(brick.x + 0.5, brick.y + 0.5, brick.width - 1, brick.height - 1);
      continue;
    }

    const color = brickColor(brick);
    ctx.fillStyle = color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

    // Chunky pixel bevel
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillRect(brick.x, brick.y, brick.width, 3);
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(brick.x, brick.y + brick.height - 3, brick.width, 3);

    // Damaged tough bricks crack visibly.
    if (brick.breakable && brick.maxHp > 1 && brick.hp < brick.maxHp) {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(brick.x + brick.width * 0.3, brick.y + 2);
      ctx.lineTo(brick.x + brick.width * 0.45, brick.y + brick.height * 0.6);
      ctx.lineTo(brick.x + brick.width * 0.62, brick.y + brick.height - 2);
      ctx.stroke();
    } else if (brick.breakable && brick.maxHp > 1) {
      // Full-strength tough bricks get a darker core.
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(brick.x + 4, brick.y + 5, brick.width - 8, brick.height - 10);
    }
  }

  // Paddle
  const paddleLeft = state.paddle.x - state.paddle.width / 2;
  ctx.fillStyle = PADDLE_COLOR;
  ctx.fillRect(paddleLeft, PADDLE_Y, state.paddle.width, PADDLE_HEIGHT);
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.fillRect(paddleLeft, PADDLE_Y, state.paddle.width, 3);

  // Balls
  ctx.fillStyle = BALL_COLOR;
  for (const ball of state.balls) {
    ctx.beginPath();
    ctx.arc(ball.pos.x, ball.pos.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  // Particles
  if (!options.reducedMotion) {
    for (const particle of juice.particles) {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
