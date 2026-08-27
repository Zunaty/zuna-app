"use client";

import { AnimatePresence, m } from "framer-motion";
import { useCallback, useEffect } from "react";

import { AsteroidsHud } from "@/components/playground/asteroids/hud";
import { ModeSelect } from "@/components/playground/asteroids/mode-select";
import { ResultsPanel } from "@/components/playground/asteroids/results-panel";
import { TouchControls } from "@/components/playground/asteroids/touch-controls";
import { Button } from "@/components/ui/button";
import { FIELD_HEIGHT, FIELD_WIDTH } from "@/lib/asteroids/constants";
import { useAsteroids } from "@/lib/asteroids/use-asteroids";
import { fadeInUp, instantTransition, motionTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

export function AsteroidsGame() {
  const reduceMotion = useReducedMotion();
  const { canvasRef, snapshot, paused, fpsTarget, start, quitToMenu, togglePause, setFpsTarget, setVirtual } =
    useAsteroids();

  const inRun = snapshot.phase === "playing" || snapshot.phase === "wave-clear";

  useEffect(() => {
    if (!inRun) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inRun, togglePause]);

  useEffect(() => {
    if (snapshot.phase !== "game-over") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "r" || event.key === "R") {
        start(snapshot.mode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [snapshot.mode, snapshot.phase, start]);

  const handleStart = useCallback(
    (mode: Parameters<typeof start>[0]) => {
      start(mode);
    },
    [start],
  );

  return (
    <div className="mx-auto w-full max-w-[640px] space-y-3">
      <AsteroidsHud
        snapshot={snapshot}
        paused={paused}
        fpsTarget={fpsTarget}
        onTogglePause={togglePause}
        onToggleFps={() => setFpsTarget(fpsTarget === 60 ? 30 : 60)}
      />

      <div
        className="relative overflow-hidden rounded-xl border border-border bg-[#070b14]"
        style={{ aspectRatio: `${FIELD_WIDTH} / ${FIELD_HEIGHT}` }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          style={{ width: "100%", height: "100%" }}
          aria-label="Asteroids game field"
        />

        <AnimatePresence>
          {snapshot.phase === "wave-clear" ? (
            <m.div
              key={`wave-clear-${snapshot.wave}`}
              variants={fadeInUp}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              exit={reduceMotion ? undefined : "exit"}
              transition={reduceMotion ? instantTransition : motionTransition}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <p className="rounded-full bg-background/80 px-5 py-2 text-lg font-bold backdrop-blur-sm">
                Wave {snapshot.wave} clear!
              </p>
            </m.div>
          ) : null}
        </AnimatePresence>

        {snapshot.phase === "idle" ? <ModeSelect onStart={handleStart} /> : null}

        {snapshot.phase === "game-over" ? (
          <ResultsPanel snapshot={snapshot} onPlayAgain={() => handleStart(snapshot.mode)} onChangeMode={quitToMenu} />
        ) : null}

        {paused && inRun ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/90 backdrop-blur-sm">
            <h2 className="text-xl font-bold">Paused</h2>
            <div className="flex gap-3">
              <Button onClick={togglePause}>Resume</Button>
              <Button variant="outline" onClick={quitToMenu}>
                Quit to menu
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {inRun ? <TouchControls onChange={setVirtual} /> : null}
    </div>
  );
}
