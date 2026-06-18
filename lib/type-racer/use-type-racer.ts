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
  stats: TypeRacerStats | null;
  isPersonalBest: boolean;
  bestScore: TypeRacerBestScore | null;
};

type TypeRacerAction =
  | { type: "SET_MODE"; mode: TypeRacerMode }
  | { type: "START" }
  | { type: "TICK_COUNTDOWN" }
  | { type: "BEGIN_RUNNING" }
  | { type: "SET_INPUT"; value: string }
  | { type: "TICK_TIMER"; deltaMs: number }
  | { type: "RESET" };

function createInitialState(mode: TypeRacerMode = "words-60"): TypeRacerState {
  return {
    phase: "idle",
    mode,
    prompt: "",
    input: "",
    countdown: TYPE_RACER_COUNTDOWN_START,
    timeLeftMs: TYPE_RACER_MODE_DURATION_MS[mode],
    stats: null,
    isPersonalBest: false,
    bestScore: null,
  };
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
      return {
        ...state,
        phase: "running",
        countdown: 0,
      };
    case "SET_INPUT": {
      if (state.phase !== "running") {
        return state;
      }

      const nextInput = action.value.replace(/\r?\n/g, " ");
      const nextState = { ...state, input: nextInput };

      if (nextInput === state.prompt) {
        const elapsedMs = TYPE_RACER_MODE_DURATION_MS[state.mode] - state.timeLeftMs;
        return finishState(nextState, elapsedMs);
      }

      return nextState;
    }
    case "TICK_TIMER": {
      if (state.phase !== "running") {
        return state;
      }

      const timeLeftMs = Math.max(0, state.timeLeftMs - action.deltaMs);

      if (timeLeftMs === 0) {
        const elapsedMs = TYPE_RACER_MODE_DURATION_MS[state.mode];
        return finishState({ ...state, timeLeftMs }, elapsedMs);
      }

      return { ...state, timeLeftMs };
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
    if (state.phase !== "running") {
      return;
    }

    const intervalId = window.setInterval(() => {
      dispatch({ type: "TICK_TIMER", deltaMs: 100 });
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [state.phase]);

  const setMode = useCallback((mode: TypeRacerMode) => {
    dispatch({ type: "SET_MODE", mode });
  }, []);

  const start = useCallback(() => {
    dispatch({ type: "START" });
  }, []);

  const setInput = useCallback((value: string) => {
    dispatch({ type: "SET_INPUT", value });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    setMode,
    start,
    setInput,
    reset,
  };
}
