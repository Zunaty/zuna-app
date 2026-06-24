"use client";

import { HelpCircle, Minus, Plus, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { VOLUME_MAX, VOLUME_MIN } from "@/lib/prompt-run/constants";
import { cn } from "@/lib/utils";

type OnboardingDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function OnboardingDialog({ open, onClose }: OnboardingDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-50 m-auto max-h-[min(90vh,40rem)] w-[min(100%-2rem,32rem)] overflow-y-auto",
        "rounded-xl border bg-background p-0 text-foreground shadow-lg backdrop:bg-black/50",
        "open:animate-in open:fade-in-0",
      )}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">How to play</p>
            <h2 className="mt-1 text-xl font-semibold">Prompt Run</h2>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>

        <section className="space-y-2 text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground">The loop</h3>
          <p>
            Draft one option per category to build a prompt. Chase rare picks and streak bonuses, spend points in the
            shop from round 2 onward, then generate AI art from your assembled prompt.
          </p>
        </section>

        <section className="space-y-2 text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground">Rarities</h3>
          <ul className="space-y-1">
            <li>
              <span className="text-foreground">Common → Legendary</span> — higher rarity means more points per pick.
            </li>
            <li>Each card rolls its own rarity when the round starts or when you reroll a category.</li>
          </ul>
        </section>

        <section className="space-y-2 text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground">Streaks</h3>
          <p>
            Picking Rare or better in a row builds a streak. At 3+ picks you earn bonus multipliers on each subsequent
            Rare+ pick. Common or Uncommon picks reset the streak.
          </p>
        </section>

        <section className="space-y-2 text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground">Round bonuses</h3>
          <ul className="space-y-1">
            <li>Finish under 30 seconds with no skipped categories for a speed bonus.</li>
            <li>All Epic+ or all Legendary picks unlock bigger round bonuses.</li>
          </ul>
        </section>

        <section className="space-y-2 text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground">Shop & generate</h3>
          <p>
            The shop unlocks on round 2. Purchases cost run score and add variables to your prompt. After each round,
            generate an image or scrap the prompt for bonus points instead.
          </p>
        </section>

        <Button type="button" className="w-full" onClick={onClose}>
          Got it
        </Button>
      </div>
    </dialog>
  );
}

type VolumeDialogProps = {
  open: boolean;
  onClose: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeDown: () => void;
  onVolumeUp: () => void;
  onToggleMute: () => void;
};

function VolumeDialog({ open, onClose, volume, isMuted, onVolumeDown, onVolumeUp, onToggleMute }: VolumeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const volumePercent = Math.round(volume * 100);
  const canDecrease = volume > VOLUME_MIN;
  const canIncrease = volume < VOLUME_MAX;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-50 m-auto w-[min(100%-2rem,20rem)]",
        "rounded-xl border bg-background p-0 text-foreground shadow-lg backdrop:bg-black/50",
      )}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Sound</p>
            <h2 className="mt-1 text-lg font-semibold">Volume</h2>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onVolumeDown}
            disabled={!canDecrease}
            aria-label="Decrease volume"
          >
            <Minus className="size-4" />
          </Button>
          <p className="min-w-[4rem] text-center font-mono text-2xl font-semibold tabular-nums" aria-live="polite">
            {isMuted ? "Off" : `${volumePercent}%`}
          </p>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onVolumeUp}
            disabled={!canIncrease}
            aria-label="Increase volume"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={onToggleMute}>
          {isMuted ? (
            <>
              <Volume2 className="size-4" />
              Unmute sounds
            </>
          ) : (
            <>
              <VolumeX className="size-4" />
              Mute sounds
            </>
          )}
        </Button>

        <Button type="button" className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </dialog>
  );
}

type GameSettingsBarProps = {
  volume: number;
  isMuted: boolean;
  onVolumeDown: () => void;
  onVolumeUp: () => void;
  onToggleMute: () => void;
  onShowRules: () => void;
  layout?: "inline" | "stacked";
  className?: string;
};

export function GameSettingsBar({
  volume,
  isMuted,
  onVolumeDown,
  onVolumeUp,
  onToggleMute,
  onShowRules,
  layout = "inline",
  className,
}: GameSettingsBarProps) {
  const [volumeOpen, setVolumeOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "shrink-0",
          layout === "stacked" ? "flex flex-col items-stretch gap-0.5" : "flex items-center gap-1",
          className,
        )}
      >
        <Button type="button" variant="ghost" size="sm" onClick={onShowRules} aria-label="How to play">
          <HelpCircle className="size-4" />
          <span className={cn(layout === "stacked" ? "ml-1.5" : "sr-only sm:not-sr-only sm:ml-1.5")}>Rules</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setVolumeOpen(true)} aria-label="Sound settings">
          {isMuted || volume <= 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </Button>
      </div>

      <VolumeDialog
        open={volumeOpen}
        onClose={() => setVolumeOpen(false)}
        volume={volume}
        isMuted={isMuted}
        onVolumeDown={onVolumeDown}
        onVolumeUp={onVolumeUp}
        onToggleMute={onToggleMute}
      />
    </>
  );
}
