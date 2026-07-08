export type BreakoutMode = "classic" | "roguelite";

export const BREAKOUT_MODES: BreakoutMode[] = ["classic", "roguelite"];

export const BREAKOUT_MODE_LABEL: Record<BreakoutMode, string> = {
  classic: "Classic",
  roguelite: "Roguelite",
};

/** Internal canvas resolution — game logic always works in these units. */
export const FIELD_WIDTH = 480;
export const FIELD_HEIGHT = 640;

export const BALL_RADIUS = 6;
export const PADDLE_BASE_WIDTH = 80;
export const PADDLE_MIN_WIDTH = 40;
export const PADDLE_MAX_WIDTH = 176;
export const PADDLE_HEIGHT = 12;
/** Top edge of the paddle. */
export const PADDLE_Y = 604;
/** Keyboard paddle speed, units/second. */
export const PADDLE_SPEED = 480;

export const BALL_BASE_SPEED = 260;
export const BALL_MAX_SPEED = 480;
/** Speed multiplier applied per level above 1. */
export const BALL_LEVEL_SPEED_RAMP = 0.06;
/** Speed gain per paddle hit, capped at BALL_HIT_RAMP_CAP × the level base speed. */
export const BALL_HIT_RAMP = 1.02;
export const BALL_HIT_RAMP_CAP = 1.25;

/** Max reflection angle away from vertical when the ball hits the paddle edge (radians). */
export const MAX_BOUNCE_ANGLE = (60 * Math.PI) / 180;
/** Max launch angle away from vertical when serving (radians). */
export const MAX_LAUNCH_ANGLE = (30 * Math.PI) / 180;

export const STARTING_LIVES = 3;
export const CLASSIC_LEVEL_COUNT = 5;

export const BRICK_COLS = 10;
export const BRICK_CELL_WIDTH = FIELD_WIDTH / BRICK_COLS;
export const BRICK_WIDTH = BRICK_CELL_WIDTH - 4;
export const BRICK_HEIGHT = 18;
export const BRICK_ROW_HEIGHT = 22;
export const BRICK_TOP_OFFSET = 60;

/** Seconds shown on the level-clear interstitial before advancing. */
export const LEVEL_CLEAR_SECONDS = 1.2;

export const VOLLEY_COMBO_BONUS = 0.1;
export const LEVEL_CLEAR_BONUS = 500;
export const LIVES_BONUS = 250;
export const DRAFT_SKIP_BONUS = 250;

export const VOLUME_MIN = 0;
export const VOLUME_MAX = 1;
