"use client";

import { useCallback, useEffect, useReducer } from "react";

import { getModeDurationMs, TYPE_RACER_COUNTDOWN_START, type TypeRacerMode } from "@/lib/type-racer/constants";
import { getMatchOptions, isStrictInputValid, promptsEqual } from "@/lib/type-racer/matching";
import { generatePrompt } from "@/lib/type-racer/prompts";
import { computeStats, type TypeRacerStats } from "@/lib/type-racer/scoring";
import { getSettings, saveSettings } from "@/lib/type-racer/settings";
import { getBestScore, saveBestScoreIfBetter, type TypeRacerBestScore } from "@/lib/type-racer/storage";

export type TypeRacerPhase = "idle" | "countdown" | "running" | "finished";

type TypeRacerState = {
  phase: TypeRacerPhase;
  mode: TypeRacerMode;
  prompt: string;
  input: string;
  countdown: number;
  timeLeftMs: number | null;
  elapsedMs: number;
  timerStarted: boolean;
  startedAt: number | null;
  strictMode: boolean;
  stats: TypeRacerStats | null;
  isPersonalBest: boolean;
  bestScore: TypeRacerBestScore | null;
};

type TypeRacerAction =
  | { type: "SET_MODE"; mode: TypeRacerMode }
  | { type: "SET_STRICT_MODE"; strictMode: boolean }
  | { type: "START" }
  | { type: "TICK_COUNTDOWN" }
  | { type: "BEGIN_RUNNING" }
  | { type: "SKIP_COUNTDOWN" }
  | { type: "SET_INPUT"; value: string; now: number }
  | { type: "TICK_TIMER"; now: number }
  | { type: "RESET" };

function getInitialTimeLeftMs(mode: TypeRacerMode): number | null {
  return getModeDurationMs(mode);
}

function createInitialState(mode: TypeRacerMode = "words-60"): TypeRacerState {
  const settings = getSettings();

  return {
    phase: "idle",
    mode,
    prompt: "",
    input: "",
    countdown: TYPE_RACER_COUNTDOWN_START,
    timeLeftMs: getInitialTimeLeftMs(mode),
    elapsedMs: 0,
    timerStarted: false,
    startedAt: null,
    strictMode: settings.strictMode,
    stats: null,
    isPersonalBest: false,
    bestScore: null,
  };
}

function getElapsedMs(state: TypeRacerState, now: number): number {
  if (!state.startedAt) {
    return 0;
  }

  const duration = getModeDurationMs(state.mode);
  const elapsed = now - state.startedAt;

  if (duration === null) {
    return elapsed;
  }

  return Math.min(duration, elapsed);
}

function getTimeLeftMs(state: TypeRacerState, now: number): number | null {
  const duration = getModeDurationMs(state.mode);

  if (duration === null) {
    return null;
  }

  return Math.max(0, duration - getElapsedMs(state, now));
}

function finishState(state: TypeRacerState, elapsedMs: number): TypeRacerState {
  const matchOptions = getMatchOptions(state.mode);
  const stats = computeStats(state.prompt, state.input, elapsedMs, matchOptions);
  const isPersonalBest = saveBestScoreIfBetter(state.mode, stats);

  return {
    ...state,
    phase: "finished",
    timeLeftMs: 0,
    stats,
    isPersonalBest,
    bestScore: getBestScore(state.mode),
  };
}

function reducer(state: TypeRacerState, action: TypeRacerAction): TypeRacerState {
  switch (action.type) {
    case "SET_MODE": {
      if (state.phase !== "idle") {
        return state;
      }

      return {
        ...state,
        mode: action.mode,
        timeLeftMs: getInitialTimeLeftMs(action.mode),
        bestScore: getBestScore(action.mode),
      };
    }
    case "SET_STRICT_MODE": {
      if (state.phase !== "idle") {
        return state;
      }

      saveSettings({ strictMode: action.strictMode });
      return { ...state, strictMode: action.strictMode };
    }
    case "START":
      return {
        ...state,
        phase: "countdown",
        prompt: generatePrompt(state.mode),
        input: "",
        countdown: TYPE_RACER_COUNTDOWN_START,
        timeLeftMs: getInitialTimeLeftMs(state.mode),
        elapsedMs: 0,
        timerStarted: false,
        startedAt: null,
        stats: null,
        isPersonalBest: false,
        bestScore: getBestScore(state.mode),
      };
    case "TICK_COUNTDOWN":
      return {
        ...state,
        countdown: state.countdown - 1,
      };
    case "BEGIN_RUNNING":
    case "SKIP_COUNTDOWN":
      return {
        ...state,
        phase: "running",
        countdown: 0,
        timerStarted: false,
        startedAt: null,
        elapsedMs: 0,
        timeLeftMs: getInitialTimeLeftMs(state.mode),
      };
    case "SET_INPUT": {
      if (state.phase !== "running") {
        return state;
      }

      const nextInput = action.value.replace(/\r?\n/g, " ");
      const matchOptions = getMatchOptions(state.mode);

      if (state.strictMode && !isStrictInputValid(state.prompt, state.input, nextInput, matchOptions)) {
        return state;
      }

      const shouldStartTimer = !state.timerStarted && nextInput.length > 0;
      const nextState: TypeRacerState = {
        ...state,
        input: nextInput,
        timerStarted: state.timerStarted || shouldStartTimer,
        startedAt: shouldStartTimer ? action.now : state.startedAt,
        timeLeftMs: shouldStartTimer ? getInitialTimeLeftMs(state.mode) : getTimeLeftMs(state, action.now),
        elapsedMs: 0,
      };

      if (nextState.timerStarted && nextState.startedAt !== null) {
        nextState.elapsedMs = getElapsedMs(nextState, action.now);
      }

      if (promptsEqual(state.prompt, nextInput, matchOptions)) {
        return finishState(nextState, nextState.elapsedMs);
      }

      return nextState;
    }
    case "TICK_TIMER": {
      if (state.phase !== "running" || !state.timerStarted || state.startedAt === null) {
        return state;
      }

      const duration = getModeDurationMs(state.mode);
      const elapsedMs = getElapsedMs(state, action.now);
      const timeLeftMs = getTimeLeftMs(state, action.now);

      if (duration !== null && timeLeftMs === 0) {
        return finishState({ ...state, timeLeftMs, elapsedMs: duration }, duration);
      }

      return { ...state, timeLeftMs, elapsedMs };
    }
    case "RESET": {
      const next = createInitialState(state.mode);
      return { ...next, strictMode: state.strictMode, bestScore: getBestScore(state.mode) };
    }
    default:
      return state;
  }
}

export function useTypeRacer(initialMode: TypeRacerMode = "words-60") {
  const [state, dispatch] = useReducer(reducer, initialMode, createInitialState);

  useEffect(() => {
    dispatch({ type: "SET_MODE", mode: initialMode });
  }, [initialMode]);

  useEffect(() => {
    if (state.phase !== "countdown") {
      return;
    }

    if (state.countdown <= 0) {
      dispatch({ type: "BEGIN_RUNNING" });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: "TICK_COUNTDOWN" });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [state.phase, state.countdown]);

  useEffect(() => {
    if (state.phase !== "running" || !state.timerStarted) {
      return;
    }

    const intervalId = window.setInterval(() => {
      dispatch({ type: "TICK_TIMER", now: Date.now() });
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [state.phase, state.timerStarted]);

  const setMode = useCallback((mode: TypeRacerMode) => {
    dispatch({ type: "SET_MODE", mode });
  }, []);

  const setStrictMode = useCallback((strictMode: boolean) => {
    dispatch({ type: "SET_STRICT_MODE", strictMode });
  }, []);

  const start = useCallback(() => {
    dispatch({ type: "START" });
  }, []);

  const skipCountdown = useCallback(() => {
    dispatch({ type: "SKIP_COUNTDOWN" });
  }, []);

  const setInput = useCallback((value: string) => {
    dispatch({ type: "SET_INPUT", value, now: Date.now() });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const matchOptions = getMatchOptions(state.mode);
  const liveStats =
    state.phase === "running" ? computeStats(state.prompt, state.input, state.elapsedMs, matchOptions) : null;

  return {
    state,
    liveStats,
    matchOptions,
    setMode,
    setStrictMode,
    start,
    skipCountdown,
    setInput,
    reset,
  };
}
