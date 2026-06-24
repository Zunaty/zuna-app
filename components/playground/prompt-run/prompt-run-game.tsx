"use client";

import { useState } from "react";

import { usePromptRun } from "@/lib/prompt-run/use-prompt-run";
import { MAX_ROUNDS } from "@/lib/prompt-run/constants";

import { GeneratePanel } from "./generate-panel";
import { OnboardingDialog } from "./onboarding-dialog";
import { OverviewPanel, RoundStage } from "./round-stage";
import { PhaseMotion } from "./phase-motion";
import { RunCompleteOverview } from "./run-complete-overview";
import { StartScreen } from "./start-screen";

export function PromptRunGame() {
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
  } = usePromptRun();

  const [showRules, setShowRules] = useState(false);
  const [showRunSummary, setShowRunSummary] = useState(false);

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
        onImageGenerated={setGeneratedImage}
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
