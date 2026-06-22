"use client";

import {
  getPromptKind,
  getWordsDuration,
  toWordsMode,
  TYPE_RACER_PROMPT_KIND_LABEL,
  TYPE_RACER_PROMPT_KINDS,
  TYPE_RACER_WORDS_DURATIONS,
  type TypeRacerMode,
  type TypeRacerPromptKind,
  type TypeRacerWordsDuration,
} from "@/lib/type-racer/constants";
import { cn } from "@/lib/utils";

type ModePickerProps = {
  mode: TypeRacerMode;
  disabled?: boolean;
  onModeChange: (mode: TypeRacerMode) => void;
};

function pickerButtonClass(selected: boolean, disabled?: boolean): string {
  return cn(
    "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
    selected
      ? "border-primary bg-primary/10 text-foreground"
      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
    disabled && "cursor-not-allowed opacity-50",
  );
}

export function ModePicker({ mode, disabled, onModeChange }: ModePickerProps) {
  const promptKind = getPromptKind(mode);
  const wordsDuration = getWordsDuration(mode);

  const handlePromptKindChange = (kind: TypeRacerPromptKind) => {
    if (kind === "words") {
      onModeChange(toWordsMode(wordsDuration));
      return;
    }

    onModeChange(kind);
  };

  const handleWordsDurationChange = (duration: TypeRacerWordsDuration) => {
    onModeChange(toWordsMode(duration));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Prompt type">
        {TYPE_RACER_PROMPT_KINDS.map((kind) => {
          const selected = promptKind === kind;

          return (
            <button
              key={kind}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => handlePromptKindChange(kind)}
              className={pickerButtonClass(selected, disabled)}
            >
              {TYPE_RACER_PROMPT_KIND_LABEL[kind]}
            </button>
          );
        })}
      </div>

      {promptKind === "words" ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Words duration">
          {TYPE_RACER_WORDS_DURATIONS.map((duration) => {
            const selected = wordsDuration === duration;

            return (
              <button
                key={duration}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => handleWordsDurationChange(duration)}
                className={pickerButtonClass(selected, disabled)}
              >
                {duration} seconds
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
