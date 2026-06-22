"use client";

import { useCallback, useEffect, useReducer } from "react";

import {
  TYPE_RACER_COUNTDOWN_START,
  TYPE_RACER_MODE_DURATION_MS,
  type TypeRacerMode,
} from "@/lib/type-racer/constants";
import { generateWordPrompt } from "@/lib/type-racer/prompts";
import { computeStats, type TypeRacerStats } from "@/lib/type-racer/scoring";
import { getBestScore, saveBestScoreIfBetter, type TypeRacerBestScore } from "@/lib/type-racer/storage";

export type TypeRacerPhase = "idle" | "countdown" | "running" | "finished";

type TypeRacerState = {
  phase: TypeRacerPhase;
  mode: TypeRacerMode;
  prompt: string;
  input: string;
  countdown: number;
  timeLeftMs: number;
  elapsedMs: number;
  timerStarted: boolean;
  startedAt: number | null;
  stats: TypeRacerStats | null;
  isPersonalBest: boolean;
  bestScore: TypeRacerBestScore | null;
};

type TypeRacerAction =
  | { type: "SET_MODE"; mode: TypeRacerMode }
  | { type: "START" }
  | { type: "TICK_COUNTDOWN" }
  | { type: "BEGIN_RUNNING" }
  | { type: "SKIP_COUNTDOWN" }
  | { type: "SET_INPUT"; value: string; now: number }
  | { type: "TICK_TIMER"; now: number }
  | { type: "RESET" };

function createInitialState(mode: TypeRacerMode = "words-60"): TypeRacerState {
  return {
    phase: "idle",
    mode,
    prompt: "",
    input: "",
    countdown: TYPE_RACER_COUNTDOWN_START,
    timeLeftMs: TYPE_RACER_MODE_DURATION_MS[mode],
    elapsedMs: 0,
    timerStarted: false,
    startedAt: null,
    stats: null,
    isPersonalBest: false,
    bestScore: null,
  };
}

function getElapsedMs(state: TypeRacerState, now: number): number {
  if (!state.startedAt) {
    return 0;
  }

  const duration = TYPE_RACER_MODE_DURATION_MS[state.mode];
  return Math.min(duration, now - state.startedAt);
}

function getTimeLeftMs(state: TypeRacerState, now: number): number {
  const duration = TYPE_RACER_MODE_DURATION_MS[state.mode];
  return Math.max(0, duration - getElapsedMs(state, now));
}

function finishState(state: TypeRacerState, elapsedMs: number): TypeRacerState {
  const stats = computeStats(state.prompt, state.input, elapsedMs);
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
        timeLeftMs: TYPE_RACER_MODE_DURATION_MS[action.mode],
        bestScore: getBestScore(action.mode),
      };
    }
    case "START":
      return {
        ...state,
        phase: "countdown",
        prompt: generateWordPrompt(),
        input: "",
        countdown: TYPE_RACER_COUNTDOWN_START,
        timeLeftMs: TYPE_RACER_MODE_DURATION_MS[state.mode],
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
        timeLeftMs: TYPE_RACER_MODE_DURATION_MS[state.mode],
      };
    case "SET_INPUT": {
      if (state.phase !== "running") {
        return state;
      }

      const nextInput = action.value.replace(/\r?\n/g, " ");
      const shouldStartTimer = !state.timerStarted && nextInput.length > 0;
      const nextState: TypeRacerState = {
        ...state,
        input: nextInput,
        timerStarted: state.timerStarted || shouldStartTimer,
        startedAt: shouldStartTimer ? action.now : state.startedAt,
        timeLeftMs: shouldStartTimer ? TYPE_RACER_MODE_DURATION_MS[state.mode] : getTimeLeftMs(state, action.now),
        elapsedMs: 0,
      };

      if (nextState.timerStarted && nextState.startedAt !== null) {
        nextState.elapsedMs = getElapsedMs(nextState, action.now);
      }

      if (nextInput === state.prompt) {
        const elapsedMs = nextState.elapsedMs;
        return finishState(nextState, elapsedMs);
      }

      return nextState;
    }
    case "TICK_TIMER": {
      if (state.phase !== "running" || !state.timerStarted || state.startedAt === null) {
        return state;
      }

      const timeLeftMs = getTimeLeftMs(state, action.now);
      const elapsedMs = getElapsedMs(state, action.now);

      if (timeLeftMs === 0) {
        const duration = TYPE_RACER_MODE_DURATION_MS[state.mode];
        return finishState({ ...state, timeLeftMs, elapsedMs: duration }, duration);
      }

      return { ...state, timeLeftMs, elapsedMs };
    }
    case "RESET": {
      const next = createInitialState(state.mode);
      return { ...next, bestScore: getBestScore(state.mode) };
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

  const liveStats = state.phase === "running" ? computeStats(state.prompt, state.input, state.elapsedMs) : null;

  return {
    state,
    liveStats,
    setMode,
    start,
    skipCountdown,
    setInput,
    reset,
  };
}
