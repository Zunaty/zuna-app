/**
 * Guest localStorage keys. Keep string values stable — changing a key wipes
 * existing guest progress for that surface.
 */
export const LOCAL_STORAGE_KEYS = {
  typeRacerBest: "zuna-type-racer-best",
  typeRacerSettings: "zuna-type-racer-settings",
  promptRun: "zuna-prompt-run",
  breakout: "zuna-breakout",
  gameSettings: "zuna-game-settings",
  achievements: "zuna-achievements",
} as const;

export type LocalStorageKey = (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS];
