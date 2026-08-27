"use client";

import { Heart, Pause, Play, Volume2, VolumeX } from "lucide-react";

import { FpsToggle } from "@/components/playground/fps-toggle";
import { Button } from "@/components/ui/button";
import { BREAKOUT_MODE_LABEL } from "@/lib/breakout/constants";
import type { BreakoutSnapshot } from "@/lib/breakout/use-breakout";
import type { BreakoutSettings } from "@/lib/breakout/storage";
import type { FpsTarget } from "@/lib/game-canvas/types";

type BreakoutHudProps = {
  snapshot: BreakoutSnapshot;
  paused: boolean;
  settings: BreakoutSettings;
  fpsTarget: FpsTarget;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleFps: () => void;
};

export function BreakoutHud({
  snapshot,
  paused,
  settings,
  fpsTarget,
  onTogglePause,
  onToggleMute,
  onToggleFps,
}: BreakoutHudProps) {
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
              Lv {snapshot.level} · {BREAKOUT_MODE_LABEL[snapshot.mode]}
            </span>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        <FpsToggle fpsTarget={fpsTarget} onToggle={onToggleFps} />
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMute}
          aria-label={settings.isMuted ? "Unmute" : "Mute"}
          className="px-2 text-muted-foreground"
        >
          {settings.isMuted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
        </Button>
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
