"use client";

import { useEffect, useRef, type RefObject } from "react";

import type { GameInput } from "@/lib/game-canvas/types";

const LEFT_KEYS = new Set(["ArrowLeft", "a", "A"]);
const RIGHT_KEYS = new Set(["ArrowRight", "d", "D"]);

export type InputHandle = {
  /** Read the current input snapshot. `primaryPressed` resets after each read. */
  read: () => GameInput;
};

/**
 * Tracks keyboard and pointer state against a canvas element, exposing a
 * per-tick snapshot. Pointer x is converted into internal canvas units.
 */
export function useGameInput(canvasRef: RefObject<HTMLCanvasElement | null>, internalWidth: number): InputHandle {
  const stateRef = useRef({
    left: false,
    right: false,
    pointerX: null as number | null,
    primaryPressed: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const state = stateRef.current;

    const toInternalX = (clientX: number): number => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) {
        return 0;
      }
      const ratio = (clientX - rect.left) / rect.width;
      return Math.min(internalWidth, Math.max(0, ratio * internalWidth));
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (LEFT_KEYS.has(event.key)) {
        state.left = true;
        event.preventDefault();
      } else if (RIGHT_KEYS.has(event.key)) {
        state.right = true;
        event.preventDefault();
      } else if (event.key === " ") {
        if (!event.repeat) {
          state.primaryPressed = true;
        }
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (LEFT_KEYS.has(event.key)) {
        state.left = false;
      } else if (RIGHT_KEYS.has(event.key)) {
        state.right = false;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      state.pointerX = toInternalX(event.clientX);
    };

    const handlePointerDown = (event: PointerEvent) => {
      state.pointerX = toInternalX(event.clientX);
      state.primaryPressed = true;
    };

    const handlePointerLeave = () => {
      state.pointerX = null;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [canvasRef, internalWidth]);

  return {
    read: () => {
      const state = stateRef.current;
      const snapshot: GameInput = {
        left: state.left,
        right: state.right,
        pointerX: state.pointerX,
        primaryPressed: state.primaryPressed,
      };
      state.primaryPressed = false;
      return snapshot;
    },
  };
}
