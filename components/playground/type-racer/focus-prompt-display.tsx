"use client";

import { m } from "framer-motion";

import { instantTransition } from "@/lib/motion/variants";
import type { MatchOptions } from "@/lib/type-racer/matching";
import { charsMatch } from "@/lib/type-racer/matching";
import { cn } from "@/lib/utils";

export type FocusKeystrokeFx = {
  index: number;
  correct: boolean;
};

type FocusPromptDisplayProps = {
  previousWord: string | null;
  currentWord: string;
  nextWord: string | null;
  currentInput: string;
  keystrokeFx: FocusKeystrokeFx | null;
  matchOptions: MatchOptions;
  reduceMotion?: boolean;
};

function getCharClassName(
  char: string,
  index: number,
  input: string,
  cursorIndex: number,
  matchOptions: MatchOptions,
): string {
  const typed = input[index];
  const isPast = index < input.length;
  const isCursor = index === cursorIndex;

  if (isPast) {
    return charsMatch(typed, char, matchOptions)
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-destructive bg-destructive/15";
  }

  if (isCursor) {
    return "border-b-2 border-primary bg-primary/10 text-foreground";
  }

  return "text-muted-foreground/45";
}

function SideWord({ word, align }: { word: string | null; align: "start" | "end" }) {
  return (
    <p
      className={cn(
        "min-w-0 flex-1 truncate text-lg tracking-wide text-muted-foreground sm:text-xl",
        align === "end" ? "text-right" : "text-left",
        word ? "opacity-100" : "opacity-0",
      )}
    >
      {word ?? "·"}
    </p>
  );
}

export function FocusPromptDisplay({
  previousWord,
  currentWord,
  nextWord,
  currentInput,
  keystrokeFx,
  matchOptions,
  reduceMotion = false,
}: FocusPromptDisplayProps) {
  const cursorIndex = currentInput.length;
  const shouldShake = !reduceMotion && keystrokeFx?.correct === false && keystrokeFx.index < currentWord.length;

  return (
    <div
      className={cn(
        "flex min-h-[8rem] max-w-full select-none flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-border bg-muted/30 px-4 py-8 font-mono",
      )}
      aria-hidden
    >
      <div className="flex w-full max-w-3xl items-baseline gap-4 sm:gap-6">
        <SideWord word={previousWord} align="end" />

        <m.p
          key={currentWord}
          className="shrink-0 text-center text-3xl font-semibold leading-tight tracking-wide sm:text-4xl"
          initial={reduceMotion ? false : { opacity: 0, x: 10 }}
          animate={shouldShake ? { x: [0, -3, 3, -2, 2, 0], opacity: 1 } : { x: 0, opacity: 1 }}
          transition={
            shouldShake ? { duration: 0.18 } : reduceMotion ? instantTransition : { duration: 0.16, ease: "easeOut" }
          }
        >
          {currentWord.split("").map((char, index) => {
            const shouldPulse = !reduceMotion && keystrokeFx?.correct === true && keystrokeFx.index === index;

            return (
              <m.span
                key={`${currentWord}-${index}`}
                className={getCharClassName(char, index, currentInput, cursorIndex, matchOptions)}
                animate={shouldPulse ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={shouldPulse ? { duration: 0.12 } : instantTransition}
              >
                {char}
              </m.span>
            );
          })}
        </m.p>

        <SideWord word={nextWord} align="start" />
      </div>

      <p className="text-xs text-muted-foreground">Type the word — no space needed</p>
    </div>
  );
}
