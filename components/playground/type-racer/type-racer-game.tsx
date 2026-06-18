"use client";

import { m } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

import { ModePicker } from "@/components/playground/type-racer/mode-picker";
import { PromptDisplay } from "@/components/playground/type-racer/prompt-display";
import { ResultsPanel } from "@/components/playground/type-racer/results-panel";
import { Button } from "@/components/ui/button";
import { TYPE_RACER_MODE_LABEL } from "@/lib/type-racer/constants";
import { instantTransition, springTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { useTypeRacer } from "@/lib/type-racer/use-type-racer";

export function TypeRacerGame() {
  const { state, setMode, start, setInput, reset } = useTypeRacer();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reduceMotion = useReducedMotion();

  const focusInput = useCallback(() => {
    if (state.phase === "running") {
      inputRef.current?.focus();
    }
  }, [state.phase]);

  useEffect(() => {
    focusInput();
  }, [focusInput, state.phase]);

  const handleStart = () => {
    start();
  };

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const timeLeftSeconds = (state.timeLeftMs / 1000).toFixed(1);
  const isActive = state.phase === "countdown" || state.phase === "running";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <ModePicker mode={state.mode} disabled={isActive} onModeChange={setMode} />
        {state.phase === "idle" ? (
          <Button size="lg" onClick={handleStart}>
            Start test
          </Button>
        ) : null}
        {state.phase === "running" ? (
          <p className="font-mono text-2xl font-semibold tabular-nums" aria-live="polite">
            {timeLeftSeconds}s
          </p>
        ) : null}
      </div>

      {state.bestScore && state.phase === "idle" ? (
        <p className="text-sm text-muted-foreground">
          Personal best ({TYPE_RACER_MODE_LABEL[state.mode]}): {state.bestScore.wpm} WPM · {state.bestScore.accuracy}%
          accuracy
        </p>
      ) : null}

      {state.phase === "countdown" ? (
        <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
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
          <PromptDisplay prompt={state.prompt} input={state.input} />
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
            Click the prompt area if focus is lost. A physical keyboard works best.
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
