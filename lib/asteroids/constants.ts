export type AsteroidsMode = "classic" | "roguelite";

export const ASTEROIDS_MODES: AsteroidsMode[] = ["classic", "roguelite"];

export const ASTEROIDS_MODE_LABEL: Record<AsteroidsMode, string> = {
  classic: "Classic",
  roguelite: "Roguelite",
};

/** Internal canvas resolution — game logic always works in these units. */
export const FIELD_WIDTH = 640;
export const FIELD_HEIGHT = 480;

export const SHIP_RADIUS = 11;
/** Rotation while a rotate key is held, radians/second. */
export const SHIP_ROTATE_SPEED = 4.2;
/** Acceleration along the nose while thrusting, units/second². */
export const SHIP_THRUST = 260;
/** Exponential drag coefficient (1/second). */
export const SHIP_DRAG = 0.55;
export const SHIP_MAX_SPEED = 320;
export const SHIP_IFRAMES = 2;

export const BASE_FIRE_RATE = 5;
export const MUZZLE_SPEED = 420;
export const BULLET_RADIUS = 2.5;
export const BULLET_LIFETIME = 1.25;
export const MAX_PROJECTILES = 6;

export const ROCK_RADIUS = {
  large: 42,
  medium: 24,
  small: 13,
} as const;

export const ROCK_SPEED = {
  large: 48,
  medium: 72,
  small: 108,
} as const;

export const ROCK_SPLIT_COUNT = 2;
export const ROCK_SPLIT_KICK = 55;
export const ROCK_SHAPE_VERTICES = 10;

export const WAVE_BASE_LARGE = 4;
export const WAVE_LARGE_PER_WAVE = 1;
export const WAVE_LARGE_CAP = 8;
export const WAVE_SPEED_RAMP = 0.1;
export const SAFE_SPAWN_RADIUS = 100;
export const CLASSIC_WAVE_COUNT = 8;
export const WAVE_CLEAR_SECONDS = 1.4;

export const STARTING_LIVES = 3;

export const ROCK_POINTS = {
  large: 20,
  medium: 50,
  small: 100,
} as const;

export const STAR_POINTS = 250;
export const WAVE_CLEAR_BONUS = 500;
export const LIVES_BONUS = 250;
export const DRAFT_SKIP_BONUS = 250;

/** Smallest collision radius on the field — used for tunneling substeps. */
export const MIN_COLLISION_RADIUS = ROCK_RADIUS.small;
