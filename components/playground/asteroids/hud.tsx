"use client";

import { Heart, Pause, Play } from "lucide-react";

import { FpsToggle } from "@/components/playground/fps-toggle";
import { Button } from "@/components/ui/button";
import { ASTEROIDS_MODE_LABEL } from "@/lib/asteroids/constants";
import type { AsteroidsSnapshot } from "@/lib/asteroids/use-asteroids";
import type { FpsTarget } from "@/lib/game-canvas/types";

type AsteroidsHudProps = {
  snapshot: AsteroidsSnapshot;
  paused: boolean;
  fpsTarget: FpsTarget;
  onTogglePause: () => void;
  onToggleFps: () => void;
};

export function AsteroidsHud({ snapshot, paused, fpsTarget, onTogglePause, onToggleFps }: AsteroidsHudProps) {
  const inGame = snapshot.phase !== "idle";

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-4 font-mono tabular-nums">
        <span className="font-semibold">{snapshot.score.toLocaleString("en-US")}</span>
        {inGame ? (
          <>
            <span className="flex items-center gap-1 text-muted-foreground" aria-label={`${snapshot.lives} lives`}>
              {Array.from({ length: Math.max(snapshot.lives, 0) }).map((_, index) => (
                <Heart key={index} className="size-3.5 fill-red-500 text-red-500" aria-hidden />
              ))}
            </span>
            <span className="text-muted-foreground">
              Wave {snapshot.wave} · {ASTEROIDS_MODE_LABEL[snapshot.mode]}
            </span>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        <FpsToggle fpsTarget={fpsTarget} onToggle={onToggleFps} />
        {inGame ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePause}
            aria-label={paused ? "Resume" : "Pause"}
            className="px-2 text-muted-foreground"
          >
            {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
