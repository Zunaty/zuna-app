"use client";

import { cn } from "@/lib/utils";

type PromptDisplayProps = {
  prompt: string;
  input: string;
  disabled?: boolean;
};

function getCharClassName(char: string, index: number, input: string, cursorIndex: number): string {
  const typed = input[index];
  const isPast = index < input.length;
  const isCursor = index === cursorIndex;

  if (isPast) {
    return typed === char ? "text-emerald-600 dark:text-emerald-400" : "text-destructive bg-destructive/15";
  }

  if (isCursor) {
    return "border-b-2 border-primary bg-primary/10 text-foreground";
  }

  return "text-muted-foreground/50";
}

function PromptChar({
  char,
  index,
  input,
  cursorIndex,
}: {
  char: string;
  index: number;
  input: string;
  cursorIndex: number;
}) {
  return <span className={getCharClassName(char, index, input, cursorIndex)}>{char}</span>;
}

export function PromptDisplay({ prompt, input, disabled }: PromptDisplayProps) {
  const cursorIndex = input.length;

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

        return (
          <span key={word.startIndex} className="inline">
            {word.text.split("").map((char, offset) => (
              <PromptChar
                key={word.startIndex + offset}
                char={char}
                index={word.startIndex + offset}
                input={input}
                cursorIndex={cursorIndex}
              />
            ))}
            {hasTrailingSpace ? (
              <PromptChar char=" " index={spaceIndex} input={input} cursorIndex={cursorIndex} />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
