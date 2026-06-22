"use client";

import { Label } from "@/components/ui/label";
import { isCaseSensitiveMode, type TypeRacerMode } from "@/lib/type-racer/constants";
import { cn } from "@/lib/utils";

type CompetitiveSettingsProps = {
  mode: TypeRacerMode;
  strictMode: boolean;
  disabled?: boolean;
  onStrictModeChange: (strictMode: boolean) => void;
};

export function CompetitiveSettings({ mode, strictMode, disabled, onStrictModeChange }: CompetitiveSettingsProps) {
  const caseSensitive = isCaseSensitiveMode(mode);
  const switchId = "type-racer-strict-mode";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          id={switchId}
          type="button"
          role="switch"
          aria-checked={strictMode}
          disabled={disabled}
          onClick={() => onStrictModeChange(!strictMode)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            strictMode ? "bg-primary" : "bg-input",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "pointer-events-none block size-5 rounded-full bg-background shadow-sm ring-0 transition-transform",
              strictMode ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
        <Label
          htmlFor={switchId}
          className={cn("cursor-pointer font-normal", disabled && "cursor-not-allowed opacity-50")}
        >
          Strict mode
        </Label>
      </div>
      <p className="text-xs text-muted-foreground">
        {caseSensitive ? "Sentences and paragraphs match case and punctuation." : "Random words ignore letter case."}
        {strictMode ? " Mistakes block progress until corrected." : " Mistakes can be corrected with backspace."}
      </p>
    </div>
  );
}
