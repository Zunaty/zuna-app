"use client";

import { useEffect, useRef } from "react";

import type { FpsTarget } from "@/lib/game-canvas/types";

/**
 * Max simulation ticks per animation frame. When the device can't keep up,
 * the game slows down instead of spiraling on an ever-growing accumulator.
 */
const MAX_TICKS_PER_FRAME = 4;

export type GameLoopCallbacks = {
  /** Step the simulation by a fixed dt (seconds). May run 0..N times per frame. */
  update: (dt: number) => void;
  /** Draw the current state. Runs once per frame, only when at least one tick ran. */
  render: () => void;
};

export type UseGameLoopOptions = {
  running: boolean;
  fpsTarget: FpsTarget;
  /** Called when the tab is hidden mid-game so callers can auto-pause. */
  onAutoPause?: () => void;
};

/**
 * Fixed-timestep game loop (accumulator pattern). Simulation steps at exactly
 * `1 / fpsTarget` seconds regardless of display refresh rate, keeping physics
 * deterministic and identical at 30 and 60 fps.
 */
export function useGameLoop({ running, fpsTarget, onAutoPause }: UseGameLoopOptions, callbacks: GameLoopCallbacks) {
  const callbacksRef = useRef(callbacks);
  const onAutoPauseRef = useRef(onAutoPause);

  useEffect(() => {
    callbacksRef.current = callbacks;
    onAutoPauseRef.current = onAutoPause;
  });

  useEffect(() => {
    if (!running) {
      return;
    }

    const dt = 1 / fpsTarget;
    const stepMs = 1000 / fpsTarget;

    let frameId = 0;
    let lastTime: number | null = null;
    let accumulator = 0;

    const frame = (time: number) => {
      frameId = window.requestAnimationFrame(frame);

      if (lastTime === null) {
        lastTime = time;
        return;
      }

      accumulator += time - lastTime;
      lastTime = time;

      let ticks = 0;
      while (accumulator >= stepMs && ticks < MAX_TICKS_PER_FRAME) {
        callbacksRef.current.update(dt);
        accumulator -= stepMs;
        ticks += 1;
      }

      // Drop excess backlog so the game slows down instead of fast-forwarding.
      if (accumulator >= stepMs) {
        accumulator = accumulator % stepMs;
      }

      if (ticks > 0) {
        callbacksRef.current.render();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        onAutoPauseRef.current?.();
      } else {
        // Discard time spent hidden so the game doesn't fast-forward on return.
        lastTime = null;
        accumulator = 0;
      }
    };

    frameId = window.requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [running, fpsTarget]);
}
