"use client";

import { useEffect, useRef, useState } from "react";

import { useAchievements } from "@/components/achievements/achievement-provider";
import { usePlaygroundScoreContext } from "@/components/playground/playground-score-provider";
import { usePromptRun } from "@/lib/prompt-run/use-prompt-run";
import { MAX_ROUNDS, STREAK_THRESHOLDS } from "@/lib/prompt-run/constants";
import { getBestRun } from "@/lib/prompt-run/storage";
import type { GeneratedImage } from "@/lib/prompt-run/types";

import { GeneratePanel } from "./generate-panel";
import { OnboardingDialog } from "./onboarding-dialog";
import { OverviewPanel, RoundStage } from "./round-stage";
import { PhaseMotion } from "./phase-motion";
import { RunCompleteOverview } from "./run-complete-overview";
import { StartScreen } from "./start-screen";

export function PromptRunGame() {
  const { unlock } = useAchievements();
  const { cloudScores, persistPromptRunBest } = usePlaygroundScoreContext();

  // "New record" requires a previous best to beat, so track whether one
  // existed before the current save (local or cloud).
  const hadBestRunRef = useRef(false);

  useEffect(() => {
    if (getBestRun() !== null || cloudScores.promptRun !== null) {
      hadBestRunRef.current = true;
    }
  }, [cloudScores.promptRun]);

  const {
    game,
    round,
    assembledPrompt,
    settings,
    pickFeedback,
    startRun,
    startRound,
    selectVariable,
    skipCategory,
    rerollCategory,
    purchaseShopItem,
    refreshShop,
    canAffordItem,
    canRefreshShop,
    continueToOverview,
    scrapRound,
    failGeneration,
    canScrap,
    setGeneratedImage,
    resetRun,
    toggleMute,
    decreaseVolume,
    increaseVolume,
    dismissOnboarding,
  } = usePromptRun({
    onBestRunSaved: (best) => {
      if (hadBestRunRef.current) {
        unlock("prompt-run-high-score");
      }
      hadBestRunRef.current = true;
      persistPromptRunBest(best);
    },
  });

  const [showRules, setShowRules] = useState(false);
  const [showRunSummary, setShowRunSummary] = useState(false);

  useEffect(() => {
    if (game.completedRounds >= 1) {
      unlock("prompt-run-first-round");
    }
  }, [game.completedRounds, unlock]);

  useEffect(() => {
    if (game.streakRecord >= STREAK_THRESHOLDS.LEGENDARY) {
      unlock("prompt-run-streak-7");
    }
  }, [game.streakRecord, unlock]);

  useEffect(() => {
    if (game.rounds.some((completed) => (completed.roundBonuses?.perfectBonus ?? 0) > 0)) {
      unlock("prompt-run-perfect");
    }
  }, [game.rounds, unlock]);

  const handleImageGenerated = (image: GeneratedImage) => {
    unlock("prompt-run-generate");
    setGeneratedImage(image);
  };

  const handleNewRun = () => {
    setShowRunSummary(false);
    resetRun();
  };

  const lastRound = game.rounds[game.rounds.length - 1];

  let phaseKey: string = game.phase;
  let content = null;

  if (game.phase === "fresh") {
    content = (
      <StartScreen
        onStart={startRun}
        settings={settings}
        onToggleMute={toggleMute}
        onVolumeDown={decreaseVolume}
        onVolumeUp={increaseVolume}
        onDismissOnboarding={dismissOnboarding}
      />
    );
  } else if (game.phase === "round" && round) {
    content = (
      <RoundStage
        game={game}
        round={round}
        pickFeedback={pickFeedback}
        volume={settings.volume}
        isMuted={settings.isMuted}
        onSelect={selectVariable}
        onSkip={skipCategory}
        onReroll={rerollCategory}
        onPurchaseShopItem={purchaseShopItem}
        onRefreshShop={refreshShop}
        canAffordShopItem={canAffordItem}
        canRefreshShop={canRefreshShop}
        onToggleMute={toggleMute}
        onVolumeDown={decreaseVolume}
        onVolumeUp={increaseVolume}
        onShowRules={() => setShowRules(true)}
      />
    );
  } else if (game.phase === "generate") {
    content = (
      <GeneratePanel
        prompt={assembledPrompt}
        rounds={game.rounds}
        existingImage={lastRound?.generatedImage}
        onImageGenerated={handleImageGenerated}
        onContinue={continueToOverview}
        onScrap={scrapRound}
        onGenerationFailed={failGeneration}
        canScrap={canScrap}
      />
    );
  } else if (game.phase === "overview" && showRunSummary && game.completedRounds >= MAX_ROUNDS) {
    phaseKey = "run-summary";
    content = <RunCompleteOverview game={game} onNewRun={handleNewRun} />;
  } else if (game.phase === "overview") {
    content = (
      <OverviewPanel
        game={game}
        prompt={assembledPrompt}
        onNextRound={startRound}
        onNewRun={handleNewRun}
        onViewRunSummary={() => setShowRunSummary(true)}
      />
    );
  }

  if (!content) {
    return null;
  }

  return (
    <>
      <PhaseMotion phaseKey={phaseKey}>{content}</PhaseMotion>
      {game.phase === "round" ? <OnboardingDialog open={showRules} onClose={() => setShowRules(false)} /> : null}
    </>
  );
}
