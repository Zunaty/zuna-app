import { describe, expect, it } from "vitest";

import {
  isPromptRunBestBetter,
  isTypeRacerScoreBetter,
  mergeBreakoutScores,
  mergePlaygroundCloudScores,
  mergePromptRunBest,
  mergeTypeRacerScores,
} from "@/lib/playground/merge-scores";

describe("mergeTypeRacerScores", () => {
  it("keeps the higher WPM per mode", () => {
    const merged = mergeTypeRacerScores(
      { "words-60": { wpm: 70, accuracy: 98, savedAt: "2026-01-01" } },
      { "words-60": { wpm: 82, accuracy: 95, savedAt: "2026-01-02" } },
    );

    expect(merged["words-60"]?.wpm).toBe(82);
  });

  it("breaks WPM ties with accuracy", () => {
    expect(
      isTypeRacerScoreBetter(
        { wpm: 80, accuracy: 99, savedAt: "2026-01-02" },
        { wpm: 80, accuracy: 95, savedAt: "2026-01-01" },
      ),
    ).toBe(true);
  });
});

describe("mergePromptRunBest", () => {
  it("prefers the higher total score", () => {
    const merged = mergePromptRunBest(
      { totalScore: 1200, completedRounds: 3, savedAt: "2026-01-01" },
      { totalScore: 900, completedRounds: 3, savedAt: "2026-01-02" },
    );

    expect(merged?.totalScore).toBe(1200);
  });

  it("breaks score ties with completed rounds", () => {
    expect(
      isPromptRunBestBetter(
        { totalScore: 1000, completedRounds: 3, savedAt: "2026-01-02" },
        { totalScore: 1000, completedRounds: 2, savedAt: "2026-01-01" },
      ),
    ).toBe(true);
  });
});

describe("mergeBreakoutScores", () => {
  it("keeps the higher score per mode", () => {
    const merged = mergeBreakoutScores(
      { classic: { score: 3200, level: 4, savedAt: "2026-01-01" } },
      {
        classic: { score: 2800, level: 5, savedAt: "2026-01-02" },
        roguelite: { score: 5100, level: 8, savedAt: "2026-01-02" },
      },
    );

    expect(merged.classic?.score).toBe(3200);
    expect(merged.roguelite?.score).toBe(5100);
  });
});

describe("mergePlaygroundCloudScores", () => {
  it("merges all games independently", () => {
    const merged = mergePlaygroundCloudScores(
      {
        typeRacer: { sentence: { wpm: 60, accuracy: 100, savedAt: "2026-01-01" } },
        promptRun: { totalScore: 500, completedRounds: 2, savedAt: "2026-01-01" },
        breakout: { classic: { score: 3000, level: 5, savedAt: "2026-01-01" } },
      },
      {
        typeRacer: { "words-60": { wpm: 75, accuracy: 97, savedAt: "2026-01-02" } },
        promptRun: { totalScore: 800, completedRounds: 3, savedAt: "2026-01-02" },
        breakout: { roguelite: { score: 4200, level: 7, savedAt: "2026-01-02" } },
      },
    );

    expect(merged.typeRacer.sentence?.wpm).toBe(60);
    expect(merged.typeRacer["words-60"]?.wpm).toBe(75);
    expect(merged.promptRun?.totalScore).toBe(800);
    expect(merged.breakout.classic?.score).toBe(3000);
    expect(merged.breakout.roguelite?.score).toBe(4200);
  });
});
