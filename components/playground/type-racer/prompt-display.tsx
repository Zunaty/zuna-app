"use client";

import { m } from "framer-motion";

import { instantTransition } from "@/lib/motion/variants";
import type { MatchOptions } from "@/lib/type-racer/matching";
import { charsMatch } from "@/lib/type-racer/matching";
import { cn } from "@/lib/utils";

export type KeystrokeFx = {
  index: number;
  correct: boolean;
};

type PromptDisplayProps = {
  prompt: string;
  input: string;
  keystrokeFx: KeystrokeFx | null;
  matchOptions: MatchOptions;
  disabled?: boolean;
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

  return "text-muted-foreground/50";
}

function findWordStartIndex(prompt: string, index: number): number {
  let start = index;
  while (start > 0 && prompt[start - 1] !== " ") {
    start--;
  }
  return start;
}

function PromptChar({
  char,
  index,
  input,
  cursorIndex,
  keystrokeFx,
  matchOptions,
  reduceMotion,
}: {
  char: string;
  index: number;
  input: string;
  cursorIndex: number;
  keystrokeFx: KeystrokeFx | null;
  matchOptions: MatchOptions;
  reduceMotion: boolean;
}) {
  const shouldPulse = !reduceMotion && keystrokeFx?.correct === true && keystrokeFx.index === index;

  return (
    <m.span
      className={getCharClassName(char, index, input, cursorIndex, matchOptions)}
      animate={shouldPulse ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={shouldPulse ? { duration: 0.12 } : instantTransition}
    >
      {char}
    </m.span>
  );
}

export function PromptDisplay({
  prompt,
  input,
  keystrokeFx,
  matchOptions,
  disabled,
  reduceMotion = false,
}: PromptDisplayProps) {
  const cursorIndex = input.length;
  const shakeWordStart =
    !reduceMotion && keystrokeFx?.correct === false ? findWordStartIndex(prompt, keystrokeFx.index) : null;

  const words: { text: string; startIndex: number }[] = [];
  let wordStart = 0;

  for (let i = 0; i <= prompt.length; i++) {
    if (i === prompt.length || prompt[i] === " ") {
      if (i > wordStart) {
        words.push({ text: prompt.slice(wordStart, i), startIndex: wordStart });
      }
      wordStart = i + 1;
    }
  }

  return (
    <div
      className={cn(
        "min-h-[8rem] max-w-full select-none overflow-hidden break-normal rounded-xl border border-border bg-muted/30 p-4 font-mono text-lg leading-relaxed sm:text-xl",
        disabled && "opacity-80",
      )}
      aria-hidden
    >
      {words.map((word) => {
        const spaceIndex = word.startIndex + word.text.length;
        const hasTrailingSpace = spaceIndex < prompt.length;
        const shouldShake = shakeWordStart === word.startIndex;

        return (
          <m.span
            key={word.startIndex}
            className="inline"
            animate={shouldShake ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
            transition={shouldShake ? { duration: 0.18 } : instantTransition}
          >
            {word.text.split("").map((char, offset) => (
              <PromptChar
                key={word.startIndex + offset}
                char={char}
                index={word.startIndex + offset}
                input={input}
                cursorIndex={cursorIndex}
                keystrokeFx={keystrokeFx}
                matchOptions={matchOptions}
                reduceMotion={reduceMotion}
              />
            ))}
            {hasTrailingSpace ? (
              <PromptChar
                char=" "
                index={spaceIndex}
                input={input}
                cursorIndex={cursorIndex}
                keystrokeFx={keystrokeFx}
                matchOptions={matchOptions}
                reduceMotion={reduceMotion}
              />
            ) : null}
          </m.span>
        );
      })}
    </div>
  );
}
