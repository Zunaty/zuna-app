"use client";

import {
  getPromptKind,
  getWordsDuration,
  toFocusMode,
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
  const timedDuration = getWordsDuration(mode);
  const showDuration = promptKind === "words" || promptKind === "focus";

  const handlePromptKindChange = (kind: TypeRacerPromptKind) => {
    if (kind === "words") {
      onModeChange(toWordsMode(timedDuration));
      return;
    }

    if (kind === "focus") {
      onModeChange(toFocusMode(timedDuration));
      return;
    }

    onModeChange(kind);
  };

  const handleDurationChange = (duration: TypeRacerWordsDuration) => {
    if (promptKind === "focus") {
      onModeChange(toFocusMode(duration));
      return;
    }

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

      {showDuration ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label={`${promptKind} duration`}>
          {TYPE_RACER_WORDS_DURATIONS.map((duration) => {
            const selected = timedDuration === duration;

            return (
              <button
                key={duration}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => handleDurationChange(duration)}
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
