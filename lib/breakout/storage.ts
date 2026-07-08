import { VOLUME_MAX, VOLUME_MIN, type BreakoutMode } from "@/lib/breakout/constants";
import type { BreakoutBestScore } from "@/lib/breakout/scoring";
import { formatBreakoutHighlight } from "@/lib/playground/highlights";
import { mergeBreakoutScores } from "@/lib/playground/merge-scores";
import { isBreakoutScoreBetter } from "@/lib/breakout/scoring";

const STORAGE_KEY = "zuna-breakout";
export const BREAKOUT_STORAGE_EVENT = "breakout-storage-updated";

export type BreakoutBestScores = Partial<Record<BreakoutMode, BreakoutBestScore>>;

export type BreakoutSettings = {
  volume: number;
  isMuted: boolean;
};

type StoragePayload = {
  bests: BreakoutBestScores;
  settings: BreakoutSettings;
};

export const DEFAULT_BREAKOUT_SETTINGS: BreakoutSettings = {
  volume: 0.5,
  isMuted: false,
};

const DEFAULT_SETTINGS = DEFAULT_BREAKOUT_SETTINGS;

function defaultPayload(): StoragePayload {
  return { bests: {}, settings: DEFAULT_SETTINGS };
}

function readStorage(): StoragePayload {
  if (typeof window === "undefined") {
    return defaultPayload();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultPayload();
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return defaultPayload();
    }

    const data = parsed as Partial<StoragePayload> & { settings?: Partial<BreakoutSettings> };

    return {
      bests: data.bests ?? {},
      settings: {
        ...DEFAULT_SETTINGS,
        ...data.settings,
        volume: Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, data.settings?.volume ?? DEFAULT_SETTINGS.volume)),
      },
    };
  } catch {
    return defaultPayload();
  }
}

function writeStorage(payload: StoragePayload): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota / private-mode failures shouldn't break the game.
  }
  window.dispatchEvent(new Event(BREAKOUT_STORAGE_EVENT));
}

export function subscribeBreakoutStorage(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener(BREAKOUT_STORAGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(BREAKOUT_STORAGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getAllBestScores(): BreakoutBestScores {
  return readStorage().bests;
}

const EMPTY_BESTS: BreakoutBestScores = {};
let cachedStorageRaw: string | null | undefined;
let cachedBestsSnapshot: BreakoutBestScores = EMPTY_BESTS;

/** Referentially-stable bests snapshot for useSyncExternalStore. */
export function getBestScoresSnapshot(): BreakoutBestScores {
  if (typeof window === "undefined") {
    return EMPTY_BESTS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedStorageRaw) {
    return cachedBestsSnapshot;
  }

  cachedStorageRaw = raw;
  cachedBestsSnapshot = readStorage().bests;
  return cachedBestsSnapshot;
}

export function getBestScore(mode: BreakoutMode): BreakoutBestScore | null {
  return readStorage().bests[mode] ?? null;
}

export function saveBestScoreIfBetter(mode: BreakoutMode, candidate: BreakoutBestScore): boolean {
  const current = getBestScore(mode);

  if (current && !isBreakoutScoreBetter(candidate, current)) {
    return false;
  }

  const payload = readStorage();
  writeStorage({ ...payload, bests: { ...payload.bests, [mode]: candidate } });
  return true;
}

export function mergeBestScoresIntoLocal(remote: BreakoutBestScores): BreakoutBestScores {
  const payload = readStorage();
  const merged = mergeBreakoutScores(payload.bests, remote);
  writeStorage({ ...payload, bests: merged });
  return merged;
}

export function getBreakoutSettings(): BreakoutSettings {
  return readStorage().settings;
}

let cachedSettingsRaw: string | null | undefined;
let cachedSettingsSnapshot: BreakoutSettings = DEFAULT_SETTINGS;

/** Referentially-stable settings snapshot for useSyncExternalStore. */
export function getBreakoutSettingsSnapshot(): BreakoutSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedSettingsRaw) {
    return cachedSettingsSnapshot;
  }

  cachedSettingsRaw = raw;
  cachedSettingsSnapshot = readStorage().settings;
  return cachedSettingsSnapshot;
}

export function saveBreakoutSettings(settings: BreakoutSettings): void {
  const payload = readStorage();
  writeStorage({ ...payload, settings });
}

export function getBestScoreHighlight(cloudScores?: BreakoutBestScores): string | null {
  const scores = cloudScores ? mergeBreakoutScores(getAllBestScores(), cloudScores) : getAllBestScores();
  return formatBreakoutHighlight(scores);
}
