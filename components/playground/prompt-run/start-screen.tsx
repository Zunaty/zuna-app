"use client";

import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MAX_ROUNDS } from "@/lib/prompt-run/constants";
import { getBestRunSnapshot, subscribePromptRunStorage } from "@/lib/prompt-run/storage";

import { GameSettingsBar, OnboardingDialog } from "./onboarding-dialog";

type StartScreenProps = {
  onStart: () => void;
  settings: {
    volume: number;
    isMuted: boolean;
    hasSeenOnboarding: boolean;
  };
  onToggleMute: () => void;
  onVolumeDown: () => void;
  onVolumeUp: () => void;
  onDismissOnboarding: () => void;
};

export function StartScreen({
  onStart,
  settings,
  onToggleMute,
  onVolumeDown,
  onVolumeUp,
  onDismissOnboarding,
}: StartScreenProps) {
  const bestRun = useSyncExternalStore(subscribePromptRunStorage, getBestRunSnapshot, () => null);
  const [showOnboarding, setShowOnboarding] = useState(!settings.hasSeenOnboarding);

  const closeOnboarding = () => {
    setShowOnboarding(false);
    onDismissOnboarding();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Start a run</CardTitle>
              <CardDescription>
                Draft prompt fragments across six categories, chase streaks, and assemble a new prompt each round. The
                shop unlocks on round 2. Runs save in this browser.
              </CardDescription>
            </div>
            <GameSettingsBar
              volume={settings.volume}
              isMuted={settings.isMuted}
              onVolumeDown={onVolumeDown}
              onVolumeUp={onVolumeUp}
              onToggleMute={onToggleMute}
              onShowRules={() => setShowOnboarding(true)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bestRun ? (
            <p className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Personal best: <span className="font-mono font-semibold text-foreground">{bestRun.totalScore}</span> pts
              across {bestRun.completedRounds} round{bestRun.completedRounds === 1 ? "" : "s"}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Up to {MAX_ROUNDS} rounds per run. Generate AI art after each round when generation is enabled.
          </p>
          <Button type="button" onClick={onStart}>
            Start run
          </Button>
        </CardContent>
      </Card>

      <OnboardingDialog open={showOnboarding} onClose={closeOnboarding} />
    </>
  );
}
