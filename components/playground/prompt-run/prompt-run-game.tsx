"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePromptRun } from "@/lib/prompt-run/use-prompt-run";

import { GeneratePanel } from "./generate-panel";
import { OverviewPanel, RoundStage } from "./round-stage";

export function PromptRunGame() {
  const {
    game,
    round,
    assembledPrompt,
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
    setGeneratedImage,
    resetRun,
  } = usePromptRun();

  if (game.phase === "fresh") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Start a run</CardTitle>
          <CardDescription>
            Draft prompt fragments across six categories, chase streaks, and assemble a prompt each round. The shop
            unlocks on round 2. Runs save in this browser so you can pick up where you left off.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={startRun}>
            Start run
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (game.phase === "round" && round) {
    return (
      <RoundStage
        game={game}
        round={round}
        onSelect={selectVariable}
        onSkip={skipCategory}
        onReroll={rerollCategory}
        onPurchaseShopItem={purchaseShopItem}
        onRefreshShop={refreshShop}
        canAffordShopItem={canAffordItem}
        canRefreshShop={canRefreshShop}
      />
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
      />
    );
  }

  if (game.phase === "overview") {
    return <OverviewPanel game={game} prompt={assembledPrompt} onNextRound={startRound} onNewRun={resetRun} />;
  }

  return null;
}
