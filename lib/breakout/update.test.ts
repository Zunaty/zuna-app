import { describe, expect, it } from "vitest";

import { FIELD_HEIGHT, LEVEL_CLEAR_SECONDS, STARTING_LIVES } from "@/lib/breakout/constants";
import type { BreakoutState } from "@/lib/breakout/types";
import { applyDraftPick, createBreakoutState, updateBreakout } from "@/lib/breakout/update";
import type { GameInput } from "@/lib/game-canvas/types";

const idleInput: GameInput = {
  left: false,
  right: false,
  up: false,
  pointerX: null,
  primaryPressed: false,
  fireHeld: false,
};
const serveInput: GameInput = { ...idleInput, primaryPressed: true };

const DT = 1 / 60;

describe("createBreakoutState", () => {
  it("starts in serve with a stuck ball and full lives", () => {
    const state = createBreakoutState("classic", 42);

    expect(state.phase).toBe("serve");
    expect(state.level).toBe(1);
    expect(state.lives).toBe(STARTING_LIVES);
    expect(state.balls).toHaveLength(1);
    expect(state.balls[0].stuck).toBe(true);
    expect(state.bricks.length).toBeGreaterThan(0);
  });

  it("is deterministic for the same seed", () => {
    const a = createBreakoutState("roguelite", 7);
    const b = createBreakoutState("roguelite", 7);

    expect(a.bricks).toEqual(b.bricks);
    expect(a.rngState).toBe(b.rngState);
  });
});

describe("serve", () => {
  it("launches stuck balls on primary press", () => {
    const state = createBreakoutState("classic", 42);
    const { state: next, events } = updateBreakout(state, serveInput, DT);

    expect(next.phase).toBe("playing");
    expect(next.balls[0].stuck).toBe(false);
    expect(next.balls[0].vel.y).toBeLessThan(0);
    expect(events.some((event) => event.type === "launch")).toBe(true);
  });

  it("keeps stuck balls riding the paddle", () => {
    const state = createBreakoutState("classic", 42);
    const input: GameInput = { ...idleInput, pointerX: 100 };
    const { state: next } = updateBreakout(state, input, DT);

    expect(next.paddle.x).toBe(100);
    expect(next.balls[0].pos.x).toBeCloseTo(100);
  });
});

describe("paddle movement", () => {
  it("clamps the paddle to the field", () => {
    const state = createBreakoutState("classic", 42);
    const input: GameInput = { ...idleInput, pointerX: 0 };
    const { state: next } = updateBreakout(state, input, DT);

    expect(next.paddle.x).toBe(next.paddle.width / 2);
  });

  it("moves with keyboard input", () => {
    const state = createBreakoutState("classic", 42);
    const input: GameInput = { ...idleInput, right: true };
    const { state: next } = updateBreakout(state, input, DT);

    expect(next.paddle.x).toBeGreaterThan(state.paddle.x);
  });
});

function playingState(overrides: Partial<BreakoutState>): BreakoutState {
  const base = createBreakoutState("classic", 42);
  const launched = updateBreakout(base, serveInput, DT).state;
  return { ...launched, ...overrides };
}

describe("losing a ball", () => {
  it("costs a life and re-serves", () => {
    const state = playingState({
      balls: [
        {
          id: 99,
          pos: { x: 240, y: FIELD_HEIGHT - 4 },
          vel: { x: 0, y: 400 },
          speed: 400,
          stuck: false,
          stuckOffset: 0,
        },
      ],
    });

    const { state: next, events } = updateBreakout(state, idleInput, 0.1);

    expect(events.some((event) => event.type === "life-lost")).toBe(true);
    expect(next.lives).toBe(STARTING_LIVES - 1);
    expect(next.phase).toBe("serve");
    expect(next.balls[0].stuck).toBe(true);
  });

  it("ends the game at zero lives", () => {
    const state = playingState({
      lives: 1,
      balls: [
        {
          id: 99,
          pos: { x: 240, y: FIELD_HEIGHT - 4 },
          vel: { x: 0, y: 400 },
          speed: 400,
          stuck: false,
          stuckOffset: 0,
        },
      ],
    });

    const { state: next, events } = updateBreakout(state, idleInput, 0.1);

    expect(next.phase).toBe("game-over");
    expect(next.won).toBe(false);
    expect(events.some((event) => event.type === "game-over")).toBe(true);
  });
});

describe("level clear", () => {
  it("enters the interstitial with a bonus when no breakable bricks remain", () => {
    const state = playingState({ bricks: [] });
    const { state: next, events } = updateBreakout(state, idleInput, DT);

    expect(next.phase).toBe("level-clear");
    expect(next.levelsCleared).toBe(1);
    expect(next.score).toBeGreaterThan(state.score);

    const clearEvent = events.find((event) => event.type === "level-clear");
    expect(clearEvent).toBeDefined();
    if (clearEvent?.type === "level-clear") {
      expect(clearEvent.noMiss).toBe(true);
    }
  });

  it("advances classic to the next level after the interstitial", () => {
    const state = playingState({ bricks: [] });
    const cleared = updateBreakout(state, idleInput, DT).state;
    const { state: next } = updateBreakout(cleared, idleInput, LEVEL_CLEAR_SECONDS + DT);

    expect(next.phase).toBe("serve");
    expect(next.level).toBe(2);
    expect(next.bricks.length).toBeGreaterThan(0);
  });

  it("wins classic after clearing level 5", () => {
    const state = playingState({ bricks: [], level: 5, lives: 2 });
    const cleared = updateBreakout(state, idleInput, DT).state;
    const { state: next, events } = updateBreakout(cleared, idleInput, LEVEL_CLEAR_SECONDS + DT);

    expect(next.phase).toBe("game-over");
    expect(next.won).toBe(true);
    // Lives bonus: 250 × 2 remaining lives.
    expect(next.score).toBe(cleared.score + 500);
    expect(events.some((event) => event.type === "game-over")).toBe(true);
  });

  it("opens a draft in roguelite instead of advancing", () => {
    const base = createBreakoutState("roguelite", 42);
    const launched = updateBreakout(base, serveInput, DT).state;
    const cleared = updateBreakout({ ...launched, bricks: [] }, idleInput, DT).state;
    const { state: next, events } = updateBreakout(cleared, idleInput, LEVEL_CLEAR_SECONDS + DT);

    expect(next.phase).toBe("draft");
    expect(next.draftOptions).toHaveLength(3);
    expect(events.some((event) => event.type === "draft-open")).toBe(true);
  });
});

describe("applyDraftPick", () => {
  function draftState(): BreakoutState {
    const base = createBreakoutState("roguelite", 42);
    const launched = updateBreakout(base, serveInput, DT).state;
    const cleared = updateBreakout({ ...launched, bricks: [] }, idleInput, DT).state;
    return updateBreakout(cleared, idleInput, LEVEL_CLEAR_SECONDS + DT).state;
  }

  it("adds the modifier and builds the next level", () => {
    const state = draftState();
    const next = applyDraftPick(state, "wide-paddle");

    expect(next.modifiers).toContain("wide-paddle");
    expect(next.level).toBe(state.level + 1);
    expect(next.phase).toBe("serve");
    expect(next.draftOptions).toBeNull();
    expect(next.paddle.width).toBeGreaterThan(state.paddle.width);
  });

  it("applies extra life immediately", () => {
    const state = draftState();
    const next = applyDraftPick(state, "extra-life");

    expect(next.lives).toBe(state.lives + 1);
  });

  it("awards flat points on skip", () => {
    const state = draftState();
    const next = applyDraftPick(state, "skip");

    expect(next.score).toBe(state.score + 250);
    expect(next.modifiers).toHaveLength(0);
  });

  it("spawns extra balls after taking multiball", () => {
    const state = draftState();
    const next = applyDraftPick(state, "multiball");

    expect(next.balls).toHaveLength(2);
    expect(next.balls.every((ball) => ball.stuck)).toBe(true);
  });

  it("does nothing outside the draft phase", () => {
    const state = createBreakoutState("roguelite", 42);

    expect(applyDraftPick(state, "wide-paddle")).toBe(state);
  });
});

describe("soak: simulated play stays stable", () => {
  it.each([60, 30] as const)("survives 60 seconds of play at %i fps without blowing up", (fps) => {
    const dt = 1 / fps;
    let state = createBreakoutState("classic", 1234);

    // Serve, then track the ball with a slight offset so bounces stay angled.
    state = updateBreakout(state, serveInput, dt).state;

    const ticks = 60 * fps;
    for (let i = 0; i < ticks; i += 1) {
      const ball = state.balls[0];
      const input: GameInput = {
        ...idleInput,
        pointerX: ball ? ball.pos.x - 12 : null,
        primaryPressed: state.phase === "serve",
      };

      state = updateBreakout(state, input, dt).state;

      if (state.phase === "game-over") {
        break;
      }

      for (const b of state.balls) {
        expect(Number.isFinite(b.pos.x)).toBe(true);
        expect(Number.isFinite(b.pos.y)).toBe(true);
        expect(b.pos.x).toBeGreaterThanOrEqual(0);
        expect(b.pos.x).toBeLessThanOrEqual(480);
      }
    }

    // A tracked paddle should be breaking bricks steadily.
    expect(state.score).toBeGreaterThan(0);
    expect(state.lives).toBeGreaterThanOrEqual(0);
  });
});

describe("brick breaking", () => {
  it("breaks a brick, scores it, and bounces the ball", () => {
    const brick = {
      id: 0,
      x: 220,
      y: 300,
      width: 44,
      height: 18,
      hp: 1,
      maxHp: 1,
      breakable: true,
      points: 10,
      row: 0,
      revealed: true,
    };
    // Keep a second brick so breaking the first doesn't clear the level.
    const spare = { ...brick, id: 1, x: 20, y: 60 };

    const state = playingState({
      bricks: [brick, spare],
      balls: [
        {
          id: 5,
          pos: { x: 242, y: 326 },
          vel: { x: 0, y: -300 },
          speed: 300,
          stuck: false,
          stuckOffset: 0,
        },
      ],
    });

    const { state: next, events } = updateBreakout(state, idleInput, DT);

    expect(next.bricks).toHaveLength(1);
    expect(next.volleyCount).toBe(1);
    expect(next.score).toBe(state.score + 10);
    expect(next.balls[0].vel.y).toBeGreaterThan(0);
    expect(events.some((event) => event.type === "brick-break")).toBe(true);
  });

  it("damages tough bricks without breaking them", () => {
    const tough = {
      id: 0,
      x: 220,
      y: 300,
      width: 44,
      height: 18,
      hp: 2,
      maxHp: 2,
      breakable: true,
      points: 20,
      row: 0,
      revealed: false,
    };

    const state = playingState({
      bricks: [tough],
      balls: [
        {
          id: 5,
          pos: { x: 242, y: 326 },
          vel: { x: 0, y: -300 },
          speed: 300,
          stuck: false,
          stuckOffset: 0,
        },
      ],
    });

    const { state: next, events } = updateBreakout(state, idleInput, DT);

    expect(next.bricks).toHaveLength(1);
    expect(next.bricks[0].hp).toBe(1);
    expect(next.bricks[0].revealed).toBe(true);
    expect(next.score).toBe(state.score);
    expect(events.some((event) => event.type === "brick-hit")).toBe(true);
  });
});
