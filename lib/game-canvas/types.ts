export type Vec2 = {
  x: number;
  y: number;
};

export type FpsTarget = 30 | 60;

/** Per-tick input snapshot passed to game update functions. */
export type GameInput = {
  /** Keyboard left (ArrowLeft / A) held. */
  left: boolean;
  /** Keyboard right (ArrowRight / D) held. */
  right: boolean;
  /** Pointer x in internal canvas units, or null when the pointer is outside the canvas. */
  pointerX: number | null;
  /** True for the single tick after a click / tap / Space press. */
  primaryPressed: boolean;
};
