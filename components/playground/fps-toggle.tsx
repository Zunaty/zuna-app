"use client";

import { Gauge } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { FpsTarget } from "@/lib/game-canvas/types";

type FpsToggleProps = {
  fpsTarget: FpsTarget;
  onToggle: () => void;
};

export function FpsToggle({ fpsTarget, onToggle }: FpsToggleProps) {
  const nextTarget: FpsTarget = fpsTarget === 60 ? 30 : 60;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            aria-label={`Frame rate: ${fpsTarget} fps. Switch to ${nextTarget} fps.`}
            className="gap-1 px-2 font-mono text-xs text-muted-foreground"
          >
            <Gauge className="size-4" aria-hidden />
            {fpsTarget}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Frame rate: {fpsTarget} fps — click for {nextTarget}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
