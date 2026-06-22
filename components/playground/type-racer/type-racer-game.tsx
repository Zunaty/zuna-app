"use client";

import { m } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { LiveStats } from "@/components/playground/type-racer/live-stats";
import { ModePicker } from "@/components/playground/type-racer/mode-picker";
import { PromptDisplay, type KeystrokeFx } from "@/components/playground/type-racer/prompt-display";
import { ResultsPanel } from "@/components/playground/type-racer/results-panel";
import { Button } from "@/components/ui/button";
import { TYPE_RACER_MODE_LABEL } from "@/lib/type-racer/constants";
import { instantTransition, springTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { useTypeRacer } from "@/lib/type-racer/use-type-racer";

export function TypeRacerGame() {
  const { state, liveStats, setMode, start, skipCountdown, setInput, reset } = useTypeRacer();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastTabAtRef = useRef(0);
  const keystrokeFxTimeoutRef = useRef<number | null>(null);
  const [keystrokeFx, setKeystrokeFx] = useState<KeystrokeFx | null>(null);
  const reduceMotion = useReducedMotion();

  const focusInput = useCallback(() => {
    if (state.phase === "running") {
      inputRef.current?.focus();
    }
  }, [state.phase]);

  useEffect(() => {
    focusInput();
  }, [focusInput, state.phase]);

  useEffect(() => {
    return () => {
      if (keystrokeFxTimeoutRef.current !== null) {
        window.clearTimeout(keystrokeFxTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" && state.phase === "finished") {
        lastTabAtRef.current = Date.now();
        return;
      }

      if (event.key !== "Enter" || event.repeat) {
        return;
      }

      if (state.phase === "countdown") {
        event.preventDefault();
        skipCountdown();
        return;
      }

      if (state.phase === "idle") {
        const target = event.target;
        if (target instanceof HTMLElement && target.closest("button, a, input, textarea, select")) {
          return;
        }
        event.preventDefault();
        start();
        return;
      }

      if (state.phase === "finished" && Date.now() - lastTabAtRef.current < 2000) {
        event.preventDefault();
        lastTabAtRef.current = 0;
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reset, skipCountdown, start, state.phase]);

  const handleStart = () => {
    start();
  };

  const handleInputChange = (value: string) => {
    if (value.length > state.input.length) {
      const index = value.length - 1;
      setKeystrokeFx({
        index,
        correct: value[index] === state.prompt[index],
      });
      if (keystrokeFxTimeoutRef.current !== null) {
        window.clearTimeout(keystrokeFxTimeoutRef.current);
      }
      keystrokeFxTimeoutRef.current = window.setTimeout(() => {
        setKeystrokeFx(null);
        keystrokeFxTimeoutRef.current = null;
      }, 180);
    }

    setInput(value);
  };

  const timeLeftSeconds = (state.timeLeftMs / 1000).toFixed(1);
  const isActive = state.phase === "countdown" || state.phase === "running";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <ModePicker mode={state.mode} disabled={isActive} onModeChange={setMode} />
        <div className="flex flex-col items-end gap-1">
          {state.phase === "idle" ? (
            <Button size="lg" onClick={handleStart}>
              Start test
            </Button>
          ) : null}
          {state.phase === "running" ? (
            <>
              <p className="font-mono text-2xl font-semibold tabular-nums" aria-live="polite">
                {timeLeftSeconds}s
              </p>
              {liveStats ? <LiveStats stats={liveStats} timerStarted={state.timerStarted} /> : null}
            </>
          ) : null}
        </div>
      </div>

      {state.bestScore && state.phase === "idle" ? (
        <p className="text-sm text-muted-foreground">
          Personal best ({TYPE_RACER_MODE_LABEL[state.mode]}): {state.bestScore.wpm} WPM · {state.bestScore.accuracy}%
          accuracy
        </p>
      ) : null}

      {state.phase === "idle" ? (
        <p className="text-xs text-muted-foreground">Press Enter to start · Tab + Enter after a run to try again</p>
      ) : null}

      {state.phase === "countdown" ? (
        <div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20">
          <m.span
            key={state.countdown}
            className="font-mono text-6xl font-bold tabular-nums text-primary"
            initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={reduceMotion ? instantTransition : springTransition}
          >
            {state.countdown}
          </m.span>
          <p className="text-xs text-muted-foreground">Press Enter to skip</p>
        </div>
      ) : null}

      {state.phase === "running" ? (
        <div
          className="relative cursor-text"
          onClick={focusInput}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              focusInput();
            }
          }}
          role="presentation"
        >
          <PromptDisplay
            prompt={state.prompt}
            input={state.input}
            keystrokeFx={keystrokeFx}
            reduceMotion={reduceMotion ?? false}
          />
          <label className="sr-only" htmlFor="type-racer-input">
            Type the words shown above
          </label>
          <textarea
            id="type-racer-input"
            ref={inputRef}
            value={state.input}
            onChange={(event) => handleInputChange(event.target.value)}
            onPaste={(event) => event.preventDefault()}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            rows={1}
            className="absolute left-0 top-0 h-px w-px opacity-0"
            aria-describedby="type-racer-hint"
          />
          <p id="type-racer-hint" className="mt-2 text-xs text-muted-foreground">
            {state.timerStarted
              ? "Click the prompt area if focus is lost. A physical keyboard works best."
              : "Start typing to begin the timer."}
          </p>
        </div>
      ) : null}

      {state.phase === "finished" && state.stats ? (
        <ResultsPanel
          mode={state.mode}
          stats={state.stats}
          isPersonalBest={state.isPersonalBest}
          bestScore={state.bestScore}
          onRetry={reset}
        />
      ) : null}
    </div>
  );
}
