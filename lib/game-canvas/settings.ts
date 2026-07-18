import { LOCAL_STORAGE_KEYS } from "@/lib/storage/keys";
import {
  createLocalStorageSnapshotCache,
  readLocalJsonObject,
  subscribeStorageEvents,
  writeLocalJson,
} from "@/lib/storage/local";
import type { FpsTarget } from "@/lib/game-canvas/types";

const STORAGE_KEY = LOCAL_STORAGE_KEYS.gameSettings;
export const GAME_SETTINGS_EVENT = "game-settings-updated";

export type GameSettings = {
  fpsTarget: FpsTarget;
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  fpsTarget: 60,
};

const DEFAULT_SETTINGS = DEFAULT_GAME_SETTINGS;

export function isFpsTarget(value: unknown): value is FpsTarget {
  return value === 30 || value === 60;
}

export function getGameSettings(): GameSettings {
  const data = readLocalJsonObject(STORAGE_KEY);
  if (!data) {
    return DEFAULT_SETTINGS;
  }

  return {
    fpsTarget: isFpsTarget(data.fpsTarget) ? data.fpsTarget : DEFAULT_SETTINGS.fpsTarget,
  };
}

const settingsSnapshot = createLocalStorageSnapshotCache(STORAGE_KEY, getGameSettings, DEFAULT_SETTINGS);

/** Referentially-stable settings snapshot for useSyncExternalStore. */
export function getGameSettingsSnapshot(): GameSettings {
  return settingsSnapshot.getSnapshot();
}

export function saveGameSettings(settings: GameSettings): void {
  writeLocalJson(STORAGE_KEY, settings, { eventName: GAME_SETTINGS_EVENT, swallowErrors: true });
}

export function subscribeGameSettings(onStoreChange: () => void): () => void {
  return subscribeStorageEvents(GAME_SETTINGS_EVENT, onStoreChange);
}
