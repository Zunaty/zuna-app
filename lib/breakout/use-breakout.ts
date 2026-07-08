"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { playBreakoutSound } from "@/lib/breakout/audio";
import { FIELD_HEIGHT, FIELD_WIDTH, type BreakoutMode } from "@/lib/breakout/constants";
import { addBrickBurst, addShake, createJuice, updateJuice } from "@/lib/breakout/juice";
import type { BreakoutModifierId } from "@/lib/breakout/modifiers";
import { renderBreakout, rowColorForY } from "@/lib/breakout/render";
import { createSeed } from "@/lib/breakout/rng";
import {
  DEFAULT_BREAKOUT_SETTINGS,
  getBreakoutSettingsSnapshot,
  saveBreakoutSettings,
  subscribeBreakoutStorage,
  type BreakoutSettings,
} from "@/lib/breakout/storage";
import type { BreakoutEvent, BreakoutPhase, BreakoutState } from "@/lib/breakout/types";
import { applyDraftPick, createBreakoutState, updateBreakout } from "@/lib/breakout/update";
import { useGameInput } from "@/lib/game-canvas/input";
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

export type BreakoutSnapshot = {
  mode: BreakoutMode;
  phase: BreakoutPhase;
  level: number;
  score: number;
  lives: number;
  maxVolley: number;
  levelsCleared: number;
  flawlessLevels: number;
  modifiers: BreakoutModifierId[];
  draftOptions: BreakoutModifierId[] | null;
  won: boolean;
};

const IDLE_SNAPSHOT: BreakoutSnapshot = {
  mode: "classic",
  phase: "idle",
  level: 1,
  score: 0,
  lives: 0,
  maxVolley: 0,
  levelsCleared: 0,
  flawlessLevels: 0,
  modifiers: [],
  draftOptions: null,
  won: false,
};

function toSnapshot(state: BreakoutState): BreakoutSnapshot {
  return {
    mode: state.mode,
    phase: state.phase,
    level: state.level,
    score: state.score,
    lives: state.lives,
    maxVolley: state.maxVolley,
    levelsCleared: state.levelsCleared,
    flawlessLevels: state.flawlessLevels,
    modifiers: state.modifiers,
    draftOptions: state.draftOptions,
    won: state.won,
  };
}

function snapshotsEqual(a: BreakoutSnapshot, b: BreakoutSnapshot): boolean {
  return (
    a.mode === b.mode &&
    a.phase === b.phase &&
    a.level === b.level &&
    a.score === b.score &&
    a.lives === b.lives &&
    a.maxVolley === b.maxVolley &&
    a.levelsCleared === b.levelsCleared &&
    a.flawlessLevels === b.flawlessLevels &&
    a.modifiers === b.modifiers &&
    a.draftOptions === b.draftOptions &&
    a.won === b.won
  );
}

export type UseBreakoutOptions = {
  /** Called once when a run ends, with the final snapshot. */
  onGameOver?: (snapshot: BreakoutSnapshot) => void;
};

export function useBreakout(options?: UseBreakoutOptions) {
  const stateRef = useRef<BreakoutState | null>(null);
  const juiceRef = useRef(createJuice());
  const reducedMotion = useReducedMotion() ?? false;
  const reducedMotionRef = useRef(false);
  const onGameOverRef = useRef(options?.onGameOver);

  const [snapshot, setSnapshot] = useState<BreakoutSnapshot>(IDLE_SNAPSHOT);
  const [paused, setPaused] = useState(false);

  const settings = useSyncExternalStore(
    subscribeBreakoutStorage,
    getBreakoutSettingsSnapshot,
    () => DEFAULT_BREAKOUT_SETTINGS,
  );
  const settingsRef = useRef(DEFAULT_BREAKOUT_SETTINGS);

  const gameSettings = useSyncExternalStore(
    subscribeGameSettings,
    getGameSettingsSnapshot,
    () => DEFAULT_GAME_SETTINGS,
  );

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    onGameOverRef.current = options?.onGameOver;
    settingsRef.current = settings;
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
    renderBreakout(ctx, state, juiceRef.current, { reducedMotion: reducedMotionRef.current });
  }, [getContext]);

  const handleEvents = useCallback((events: BreakoutEvent[]) => {
    const juice = juiceRef.current;
    const currentSettings = settingsRef.current;

    for (const event of events) {
      switch (event.type) {
        case "launch":
          playBreakoutSound("launch", currentSettings);
          break;
        case "paddle-hit":
          playBreakoutSound("paddle", currentSettings);
          break;
        case "wall-hit":
          playBreakoutSound("wall", currentSettings);
          break;
        case "brick-hit":
          playBreakoutSound("brick-hit", currentSettings);
          break;
        case "brick-break":
          playBreakoutSound("brick-break", currentSettings);
          addBrickBurst(juice, event.x, event.y, rowColorForY(event.y));
          addShake(juice, 1);
          break;
        case "life-lost":
          playBreakoutSound("life-lost", currentSettings);
          addShake(juice, 5);
          break;
        case "level-clear":
          playBreakoutSound("level-clear", currentSettings);
          break;
        case "draft-open":
          break;
        case "game-over":
          playBreakoutSound("game-over", currentSettings);
          break;
      }
    }
  }, []);

  const loopPhases: BreakoutPhase[] = ["serve", "playing", "level-clear"];
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
        const { state: nextState, events } = updateBreakout(state, input.read(), dt);
        stateRef.current = nextState;
        handleEvents(events);
        updateJuice(juiceRef.current, dt);
        syncSnapshot();

        if (previousPhase !== "game-over" && nextState.phase === "game-over") {
          onGameOverRef.current?.(toSnapshot(nextState));
        }
      },
      render: renderFrame,
    },
  );

  const start = useCallback(
    (mode: BreakoutMode) => {
      stateRef.current = createBreakoutState(mode, createSeed());
      juiceRef.current = createJuice();
      setPaused(false);
      syncSnapshot();
      // Paint the initial serve frame before the loop's first tick.
      requestAnimationFrame(renderFrame);
    },
    [renderFrame, syncSnapshot],
  );

  const quitToMenu = useCallback(() => {
    stateRef.current = null;
    setPaused(false);
    setSnapshot(IDLE_SNAPSHOT);
  }, []);

  const pickDraft = useCallback(
    (pick: BreakoutModifierId | "skip") => {
      const state = stateRef.current;
      if (!state || state.phase !== "draft") {
        return;
      }

      playBreakoutSound("draft-pick", settingsRef.current);
      stateRef.current = applyDraftPick(state, pick);
      syncSnapshot();
      requestAnimationFrame(renderFrame);
    },
    [renderFrame, syncSnapshot],
  );

  const togglePause = useCallback(() => {
    setPaused((current) => !current);
  }, []);

  const updateSettings = useCallback((next: BreakoutSettings) => {
    saveBreakoutSettings(next);
  }, []);

  const setFpsTarget = useCallback((fpsTarget: FpsTarget) => {
    saveGameSettings({ ...getGameSettingsSnapshot(), fpsTarget });
  }, []);

  return {
    canvasRef,
    snapshot,
    paused,
    settings,
    fpsTarget: gameSettings.fpsTarget,
    start,
    quitToMenu,
    pickDraft,
    togglePause,
    updateSettings,
    setFpsTarget,
  };
}
