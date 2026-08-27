"use client";

import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";

import { clientXToInternal } from "@/lib/game-canvas/coords";
import type { GameInput } from "@/lib/game-canvas/types";

const LEFT_KEYS = new Set(["ArrowLeft", "a", "A"]);
const RIGHT_KEYS = new Set(["ArrowRight", "d", "D"]);
const UP_KEYS = new Set(["ArrowUp", "w", "W"]);

export type VirtualButtons = {
  left: boolean;
  right: boolean;
  up: boolean;
  fireHeld: boolean;
};

const IDLE_VIRTUAL: VirtualButtons = { left: false, right: false, up: false, fireHeld: false };

export type InputHandle = {
  /** Read the current input snapshot. `primaryPressed` resets after each read. */
  read: () => GameInput;
  /** Overlay / on-screen controls (touch). OR'd with keyboard and pointer. */
  setVirtual: (buttons: VirtualButtons) => void;
};

/**
 * Tracks keyboard and pointer state against a canvas element, exposing a
 * per-tick snapshot. Pointer x is converted into internal canvas units.
 */
export function useGameInput(canvasRef: RefObject<HTMLCanvasElement | null>, internalWidth: number): InputHandle {
  const stateRef = useRef({
    left: false,
    right: false,
    up: false,
    pointerX: null as number | null,
    primaryPressed: false,
    spaceHeld: false,
    pointerHeld: false,
  });
  const virtualRef = useRef<VirtualButtons>(IDLE_VIRTUAL);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const state = stateRef.current;

    const toInternalX = (clientX: number): number => {
      const rect = canvas.getBoundingClientRect();
      return clientXToInternal(clientX, rect.left, rect.width, internalWidth);
    };

    const resetHeld = () => {
      state.left = false;
      state.right = false;
      state.up = false;
      state.spaceHeld = false;
      state.pointerHeld = false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (LEFT_KEYS.has(event.key)) {
        state.left = true;
        event.preventDefault();
      } else if (RIGHT_KEYS.has(event.key)) {
        state.right = true;
        event.preventDefault();
      } else if (UP_KEYS.has(event.key)) {
        state.up = true;
        event.preventDefault();
      } else if (event.key === " ") {
        state.spaceHeld = true;
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
      } else if (UP_KEYS.has(event.key)) {
        state.up = false;
      } else if (event.key === " ") {
        state.spaceHeld = false;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      state.pointerX = toInternalX(event.clientX);
    };

    const handlePointerDown = (event: PointerEvent) => {
      state.pointerX = toInternalX(event.clientX);
      state.pointerHeld = true;
      state.primaryPressed = true;
    };

    const handlePointerUp = () => {
      state.pointerHeld = false;
    };

    const handlePointerLeave = () => {
      state.pointerX = null;
    };

    const handleBlur = () => {
      resetHeld();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("blur", handleBlur);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("blur", handleBlur);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [canvasRef, internalWidth]);

  const read = useCallback((): GameInput => {
    const state = stateRef.current;
    const virtual = virtualRef.current;
    const snapshot: GameInput = {
      left: state.left || virtual.left,
      right: state.right || virtual.right,
      up: state.up || virtual.up,
      pointerX: state.pointerX,
      primaryPressed: state.primaryPressed,
      fireHeld: state.spaceHeld || state.pointerHeld || virtual.fireHeld,
    };
    state.primaryPressed = false;
    return snapshot;
  }, []);

  const setVirtual = useCallback((buttons: VirtualButtons) => {
    virtualRef.current = buttons;
  }, []);

  return useMemo(() => ({ read, setVirtual }), [read, setVirtual]);
}
