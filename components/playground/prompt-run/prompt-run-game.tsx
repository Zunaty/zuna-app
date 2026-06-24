"use client";

import { useState } from "react";

import { usePromptRun } from "@/lib/prompt-run/use-prompt-run";
import { MAX_ROUNDS } from "@/lib/prompt-run/constants";

import { GeneratePanel } from "./generate-panel";
import { OnboardingDialog } from "./onboarding-dialog";
import { OverviewPanel, RoundStage } from "./round-stage";
import { RunCompleteOverview } from "./run-complete-overview";
import { StartScreen } from "./start-screen";

export function PromptRunGame() {
  const {
    game,
    round,
    assembledPrompt,
    settings,
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

  if (game.phase === "fresh") {
    return (
      <StartScreen
        onStart={startRun}
        settings={settings}
        onToggleMute={toggleMute}
        onVolumeDown={decreaseVolume}
        onVolumeUp={increaseVolume}
        onDismissOnboarding={dismissOnboarding}
      />
    );
  }

  if (game.phase === "round" && round) {
    return (
      <>
        <RoundStage
          game={game}
          round={round}
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
        <OnboardingDialog open={showRules} onClose={() => setShowRules(false)} />
      </>
    );
  }

  if (game.phase === "generate") {
    const lastRound = game.rounds[game.rounds.length - 1];
    return (
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
  }

  if (game.phase === "overview" && showRunSummary && game.completedRounds >= MAX_ROUNDS) {
    return <RunCompleteOverview game={game} onNewRun={handleNewRun} />;
  }

  if (game.phase === "overview") {
    return (
      <OverviewPanel
        game={game}
        prompt={assembledPrompt}
        onNextRound={startRound}
        onNewRun={handleNewRun}
        onViewRunSummary={() => setShowRunSummary(true)}
      />
    );
  }

  return null;
}
