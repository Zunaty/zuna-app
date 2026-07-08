import {
  BRICK_CELL_WIDTH,
  BRICK_HEIGHT,
  BRICK_ROW_HEIGHT,
  BRICK_TOP_OFFSET,
  BRICK_WIDTH,
} from "@/lib/breakout/constants";
import { nextInt } from "@/lib/breakout/rng";
import type { Brick } from "@/lib/breakout/types";

/**
 * Layout characters:
 *   `.` empty · `1` normal brick · `2` tough brick (2 HP) · `#` unbreakable
 */
export const LEVEL_LAYOUTS: readonly (readonly string[])[] = [
  // 1 — warm-up rows
  ["1111111111", "1111111111", "1111111111", "1111111111"],
  // 2 — tough core stripe
  ["1111111111", "1111111111", "2222222222", "1111111111", "1111111111"],
  // 3 — pyramid
  ["....11....", "...1221...", "..122221..", ".12222221.", "1111111111"],
  // 4 — checkerboard with anchors
  ["1.1.##.1.1", ".1.1221.1.", "1.1.11.1.1", ".1.1111.1.", "1.1.11.1.1"],
  // 5 — fortress
  ["#11111111#", "1222222221", "12#2222#21", "1222222221", "#11111111#"],
];

export const LEVEL_COUNT = LEVEL_LAYOUTS.length;

const NORMAL_POINTS = 10;
const TOUGH_POINTS = 20;
/** Extra points per row counted from the bottom of the layout — top rows pay more. */
const ROW_BONUS = 4;

/** Layout index for a level: fixed order in classic, seeded pick in roguelite. */
export function pickLayoutIndex(
  mode: "classic" | "roguelite",
  level: number,
  rngState: number,
): { index: number; rngState: number } {
  if (mode === "classic") {
    return { index: (level - 1) % LEVEL_COUNT, rngState };
  }

  const roll = nextInt(rngState, LEVEL_COUNT);
  return { index: roll.value, rngState: roll.next };
}

/** Extra HP for every breakable brick from looping the layouts in roguelite. */
export function loopHpBonus(mode: "classic" | "roguelite", level: number): number {
  if (mode === "classic") {
    return 0;
  }
  return Math.floor((level - 1) / LEVEL_COUNT);
}

export function createBricks(layoutIndex: number, hpBonus: number, blackout: boolean): Brick[] {
  const layout = LEVEL_LAYOUTS[layoutIndex];
  const rowCount = layout.length;
  const bricks: Brick[] = [];
  let id = 0;

  for (let row = 0; row < rowCount; row += 1) {
    const line = layout[row];

    for (let col = 0; col < line.length; col += 1) {
      const char = line[col];
      if (char === ".") {
        continue;
      }

      const breakable = char !== "#";
      const baseHp = char === "2" ? 2 : 1;
      const basePoints = char === "2" ? TOUGH_POINTS : NORMAL_POINTS;
      const hp = breakable ? baseHp + hpBonus : Number.POSITIVE_INFINITY;

      bricks.push({
        id: id++,
        x: col * BRICK_CELL_WIDTH + (BRICK_CELL_WIDTH - BRICK_WIDTH) / 2,
        y: BRICK_TOP_OFFSET + row * BRICK_ROW_HEIGHT,
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hp,
        maxHp: hp,
        breakable,
        points: breakable ? basePoints + (rowCount - 1 - row) * ROW_BONUS : 0,
        row,
        revealed: !blackout,
      });
    }
  }

  return bricks;
}
