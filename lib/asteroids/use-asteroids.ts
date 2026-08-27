"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { AsteroidsMode } from "@/lib/asteroids/constants";
import { FIELD_HEIGHT, FIELD_WIDTH } from "@/lib/asteroids/constants";
import { renderAsteroids } from "@/lib/asteroids/render";
import { createSeed } from "@/lib/asteroids/rng";
import type { AsteroidsPhase, AsteroidsState } from "@/lib/asteroids/types";
import { createAsteroidsState, updateAsteroids } from "@/lib/asteroids/update";
import { useGameInput, type VirtualButtons } from "@/lib/game-canvas/input";
import {
  DEFAULT_GAME_SETTINGS,
  getGameSettingsSnapshot,
  saveGameSettings,
  subscribeGameSettings,
} from "@/lib/game-canvas/settings";
import type { FpsTarget } from "@/lib/game-canvas/types";
import { useCanvas } from "@/lib/game-canvas/use-canvas";
import { useGameLoop } from "@/lib/game-canvas/use-game-loop";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

export type AsteroidsSnapshot = {
  mode: AsteroidsMode;
  phase: AsteroidsPhase;
  wave: number;
  score: number;
  lives: number;
  wavesCleared: number;
  won: boolean;
};

const IDLE_SNAPSHOT: AsteroidsSnapshot = {
  mode: "classic",
  phase: "idle",
  wave: 1,
  score: 0,
  lives: 0,
  wavesCleared: 0,
  won: false,
};

const IDLE_VIRTUAL: VirtualButtons = { left: false, right: false, up: false, fireHeld: false };

function toSnapshot(state: AsteroidsState): AsteroidsSnapshot {
  return {
    mode: state.mode,
    phase: state.phase,
    wave: state.wave,
    score: state.score,
    lives: state.lives,
    wavesCleared: state.wavesCleared,
    won: state.won,
  };
}

function snapshotsEqual(a: AsteroidsSnapshot, b: AsteroidsSnapshot): boolean {
  return (
    a.mode === b.mode &&
    a.phase === b.phase &&
    a.wave === b.wave &&
    a.score === b.score &&
    a.lives === b.lives &&
    a.wavesCleared === b.wavesCleared &&
    a.won === b.won
  );
}

export type UseAsteroidsOptions = {
  onGameOver?: (snapshot: AsteroidsSnapshot) => void;
};

export function useAsteroids(options?: UseAsteroidsOptions) {
  const stateRef = useRef<AsteroidsState | null>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const reducedMotionRef = useRef(false);
  const onGameOverRef = useRef(options?.onGameOver);

  const [snapshot, setSnapshot] = useState<AsteroidsSnapshot>(IDLE_SNAPSHOT);
  const [paused, setPaused] = useState(false);

  const gameSettings = useSyncExternalStore(
    subscribeGameSettings,
    getGameSettingsSnapshot,
    () => DEFAULT_GAME_SETTINGS,
  );

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    onGameOverRef.current = options?.onGameOver;
  });

  const { canvasRef, getContext } = useCanvas({ internalWidth: FIELD_WIDTH, internalHeight: FIELD_HEIGHT });
  const input = useGameInput(canvasRef, FIELD_WIDTH);

  const syncSnapshot = useCallback(() => {
    const state = stateRef.current;
    if (!state) {
      return;
    }
    const next = toSnapshot(state);
    setSnapshot((current) => (snapshotsEqual(current, next) ? current : next));
  }, []);

  const renderFrame = useCallback(() => {
    const ctx = getContext();
    const state = stateRef.current;
    if (!ctx || !state) {
      return;
    }
    renderAsteroids(ctx, state, { reducedMotion: reducedMotionRef.current });
  }, [getContext]);

  const loopPhases: AsteroidsPhase[] = ["playing", "wave-clear"];
  const running = !paused && loopPhases.includes(snapshot.phase);

  useGameLoop(
    {
      running,
      fpsTarget: gameSettings.fpsTarget,
      onAutoPause: () => setPaused(true),
    },
    {
      update: (dt) => {
        const state = stateRef.current;
        if (!state) {
          return;
        }

        const previousPhase = state.phase;
        const { state: nextState } = updateAsteroids(state, input.read(), dt);
        stateRef.current = nextState;
        syncSnapshot();

        if (previousPhase !== "game-over" && nextState.phase === "game-over") {
          onGameOverRef.current?.(toSnapshot(nextState));
        }
      },
      render: renderFrame,
    },
  );

  const start = useCallback(
    (mode: AsteroidsMode) => {
      stateRef.current = createAsteroidsState(mode, createSeed());
      input.setVirtual(IDLE_VIRTUAL);
      setPaused(false);
      syncSnapshot();
      requestAnimationFrame(renderFrame);
    },
    [input, renderFrame, syncSnapshot],
  );

  const quitToMenu = useCallback(() => {
    stateRef.current = null;
    input.setVirtual(IDLE_VIRTUAL);
    setPaused(false);
    setSnapshot(IDLE_SNAPSHOT);
  }, [input]);

  const togglePause = useCallback(() => {
    setPaused((current) => !current);
  }, []);

  const setFpsTarget = useCallback((fpsTarget: FpsTarget) => {
    saveGameSettings({ ...getGameSettingsSnapshot(), fpsTarget });
  }, []);

  const setVirtual = useCallback(
    (buttons: VirtualButtons) => {
      input.setVirtual(buttons);
    },
    [input],
  );

  return {
    canvasRef,
    snapshot,
    paused,
    fpsTarget: gameSettings.fpsTarget,
    start,
    quitToMenu,
    togglePause,
    setFpsTarget,
    setVirtual,
  };
}
