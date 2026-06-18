"use client";

import { TYPE_RACER_MODE_LABEL, TYPE_RACER_MODES, type TypeRacerMode } from "@/lib/type-racer/constants";
import { cn } from "@/lib/utils";

type ModePickerProps = {
  mode: TypeRacerMode;
  disabled?: boolean;
  onModeChange: (mode: TypeRacerMode) => void;
};

export function ModePicker({ mode, disabled, onModeChange }: ModePickerProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Test duration">
      {TYPE_RACER_MODES.map((option) => {
        const selected = option === mode;

        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onModeChange(option)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              selected
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {TYPE_RACER_MODE_LABEL[option]}
          </button>
        );
      })}
    </div>
  );
}
