"use client";

import { AnimatePresence, m } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { useAchievements } from "@/components/achievements/achievement-provider";
import { BreakoutHud } from "@/components/playground/breakout/hud";
import { DraftOverlay } from "@/components/playground/breakout/draft-overlay";
import { ModeSelect } from "@/components/playground/breakout/mode-select";
import { ResultsPanel } from "@/components/playground/breakout/results-panel";
import { usePlaygroundScoreContext } from "@/components/playground/playground-score-provider";
import { Button } from "@/components/ui/button";
import { countCurses } from "@/lib/breakout/modifiers";
import type { BreakoutBestScore } from "@/lib/breakout/scoring";
import {
  getBestScore,
  getBestScoresSnapshot,
  saveBestScoreIfBetter,
  subscribeBreakoutStorage,
  type BreakoutBestScores,
} from "@/lib/breakout/storage";
import { useBreakout, type BreakoutSnapshot } from "@/lib/breakout/use-breakout";
import { FIELD_HEIGHT, FIELD_WIDTH } from "@/lib/breakout/constants";
import { mergeBreakoutScores } from "@/lib/playground/merge-scores";
import { fadeInUp, instantTransition, motionTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

const EMPTY_BESTS: BreakoutBestScores = {};

export function BreakoutGame() {
  const { unlock } = useAchievements();
  const { cloudScores, persistBreakoutBest } = usePlaygroundScoreContext();
  const reduceMotion = useReducedMotion();

  const [isPersonalBest, setIsPersonalBest] = useState(false);

  const localBests = useSyncExternalStore(subscribeBreakoutStorage, getBestScoresSnapshot, () => EMPTY_BESTS);
  const bests = useMemo(
    () => mergeBreakoutScores(localBests, cloudScores.breakout),
    [localBests, cloudScores.breakout],
  );

  const handleGameOver = useCallback(
    (final: BreakoutSnapshot) => {
      const candidate: BreakoutBestScore = {
        score: final.score,
        level: final.levelsCleared,
        savedAt: new Date().toISOString(),
      };

      const hadBest = getBestScore(final.mode) !== null;
      const savedAsBest = saveBestScoreIfBetter(final.mode, candidate);
      setIsPersonalBest(savedAsBest);

      if (savedAsBest) {
        if (hadBest) {
          unlock("breakout-high-score");
        }
        persistBreakoutBest(final.mode, candidate);
      }
    },
    [persistBreakoutBest, unlock],
  );

  const {
    canvasRef,
    snapshot,
    paused,
    settings,
    fpsTarget,
    start,
    quitToMenu,
    pickDraft,
    togglePause,
    updateSettings,
    setFpsTarget,
  } = useBreakout({ onGameOver: handleGameOver });

  // Achievements driven by run progress.
  useEffect(() => {
    if (snapshot.levelsCleared >= 1) {
      unlock("breakout-first-clear");
    }
    if (snapshot.levelsCleared >= 1 && countCurses(snapshot.modifiers) >= 3) {
      unlock("breakout-cursed");
    }
  }, [snapshot.levelsCleared, snapshot.modifiers, unlock]);

  useEffect(() => {
    if (snapshot.flawlessLevels >= 1) {
      unlock("breakout-no-miss");
    }
  }, [snapshot.flawlessLevels, unlock]);

  useEffect(() => {
    if (snapshot.maxVolley >= 5) {
      unlock("breakout-combo-5");
    }
  }, [snapshot.maxVolley, unlock]);

  useEffect(() => {
    if (snapshot.phase === "game-over" && snapshot.won && snapshot.mode === "classic") {
      unlock("breakout-classic");
    }
  }, [snapshot.phase, snapshot.won, snapshot.mode, unlock]);

  useEffect(() => {
    if (snapshot.mode === "roguelite" && snapshot.level >= 10) {
      unlock("breakout-run-deep");
    }
  }, [snapshot.mode, snapshot.level, unlock]);

  // Esc toggles pause during a run.
  const inRun = snapshot.phase === "serve" || snapshot.phase === "playing" || snapshot.phase === "level-clear";
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

  const handleStart = useCallback(
    (mode: Parameters<typeof start>[0]) => {
      setIsPersonalBest(false);
      start(mode);
    },
    [start],
  );

  return (
    <div className="mx-auto w-full max-w-[480px] space-y-3">
      <BreakoutHud
        snapshot={snapshot}
        paused={paused}
        settings={settings}
        fpsTarget={fpsTarget}
        onTogglePause={togglePause}
        onToggleMute={() => updateSettings({ ...settings, isMuted: !settings.isMuted })}
        onToggleFps={() => setFpsTarget(fpsTarget === 60 ? 30 : 60)}
      />

      <div
        className="relative overflow-hidden rounded-xl border border-border bg-[#0b1020]"
        style={{ aspectRatio: `${FIELD_WIDTH} / ${FIELD_HEIGHT}` }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          style={{ width: "100%", height: "100%" }}
          aria-label="Breakout game field"
        />

        {/* CRT scanline overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, #000 3px)",
          }}
        />

        {snapshot.phase === "serve" && !paused ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-16 text-center text-xs font-medium text-white/60">
            Click, tap, or press Space to launch
          </p>
        ) : null}

        <AnimatePresence>
          {snapshot.phase === "level-clear" ? (
            <m.div
              key={`level-clear-${snapshot.level}`}
              variants={fadeInUp}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              exit={reduceMotion ? undefined : "exit"}
              transition={reduceMotion ? instantTransition : motionTransition}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <p className="rounded-full bg-background/80 px-5 py-2 text-lg font-bold backdrop-blur-sm">
                Level {snapshot.level} clear!
              </p>
            </m.div>
          ) : null}
        </AnimatePresence>

        {snapshot.phase === "idle" ? <ModeSelect bests={bests} onStart={handleStart} /> : null}

        {snapshot.phase === "draft" && snapshot.draftOptions ? (
          <DraftOverlay options={snapshot.draftOptions} onPick={pickDraft} />
        ) : null}

        {snapshot.phase === "game-over" ? (
          <ResultsPanel
            snapshot={snapshot}
            isPersonalBest={isPersonalBest}
            onPlayAgain={() => handleStart(snapshot.mode)}
            onChangeMode={quitToMenu}
          />
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
    </div>
  );
}
