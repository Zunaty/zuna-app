import { VOLUME_MAX, VOLUME_MIN, type BreakoutMode } from "@/lib/breakout/constants";
import type { BreakoutBestScore } from "@/lib/breakout/scoring";
import { formatBreakoutHighlight } from "@/lib/playground/highlights";
import { mergeBreakoutScores } from "@/lib/playground/merge-scores";
import { isBreakoutScoreBetter } from "@/lib/breakout/scoring";
import { LOCAL_STORAGE_KEYS } from "@/lib/storage/keys";
import {
  createLocalStorageSnapshotCache,
  readLocalJsonObject,
  subscribeStorageEvents,
  writeLocalJson,
} from "@/lib/storage/local";

const STORAGE_KEY = LOCAL_STORAGE_KEYS.breakout;
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
const EMPTY_BESTS: BreakoutBestScores = {};

function defaultPayload(): StoragePayload {
  return { bests: {}, settings: DEFAULT_SETTINGS };
}

function readStorage(): StoragePayload {
  const data = readLocalJsonObject(STORAGE_KEY) as
    | (Partial<StoragePayload> & { settings?: Partial<BreakoutSettings> })
    | null;

  if (!data) {
    return defaultPayload();
  }

  return {
    bests: data.bests ?? {},
    settings: {
      ...DEFAULT_SETTINGS,
      ...data.settings,
      volume: Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, data.settings?.volume ?? DEFAULT_SETTINGS.volume)),
    },
  };
}

function writeStorage(payload: StoragePayload): void {
  writeLocalJson(STORAGE_KEY, payload, { eventName: BREAKOUT_STORAGE_EVENT, swallowErrors: true });
}

export function subscribeBreakoutStorage(onStoreChange: () => void): () => void {
  return subscribeStorageEvents(BREAKOUT_STORAGE_EVENT, onStoreChange);
}

export function getAllBestScores(): BreakoutBestScores {
  return readStorage().bests;
}

const bestsSnapshot = createLocalStorageSnapshotCache(STORAGE_KEY, () => readStorage().bests, EMPTY_BESTS);

/** Referentially-stable bests snapshot for useSyncExternalStore. */
export function getBestScoresSnapshot(): BreakoutBestScores {
  return bestsSnapshot.getSnapshot();
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

const settingsSnapshot = createLocalStorageSnapshotCache(STORAGE_KEY, () => readStorage().settings, DEFAULT_SETTINGS);

/** Referentially-stable settings snapshot for useSyncExternalStore. */
export function getBreakoutSettingsSnapshot(): BreakoutSettings {
  return settingsSnapshot.getSnapshot();
}

export function saveBreakoutSettings(settings: BreakoutSettings): void {
  const payload = readStorage();
  writeStorage({ ...payload, settings });
}

export function getBestScoreHighlight(cloudScores?: BreakoutBestScores): string | null {
  const scores = cloudScores ? mergeBreakoutScores(getAllBestScores(), cloudScores) : getAllBestScores();
  return formatBreakoutHighlight(scores);
}
