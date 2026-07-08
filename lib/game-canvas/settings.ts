import type { FpsTarget } from "@/lib/game-canvas/types";

const STORAGE_KEY = "zuna-game-settings";
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
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return DEFAULT_SETTINGS;
    }

    const data = parsed as Partial<GameSettings>;
    return {
      fpsTarget: isFpsTarget(data.fpsTarget) ? data.fpsTarget : DEFAULT_SETTINGS.fpsTarget,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

let cachedRaw: string | null | undefined;
let cachedSnapshot: GameSettings = DEFAULT_SETTINGS;

/** Referentially-stable settings snapshot for useSyncExternalStore. */
export function getGameSettingsSnapshot(): GameSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  cachedRaw = raw;
  cachedSnapshot = getGameSettings();
  return cachedSnapshot;
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Quota / private-mode failures shouldn't break the game.
  }
  window.dispatchEvent(new Event(GAME_SETTINGS_EVENT));
}

export function subscribeGameSettings(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener(GAME_SETTINGS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(GAME_SETTINGS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
