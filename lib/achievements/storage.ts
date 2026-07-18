import type { AchievementId } from "@/lib/achievements/definitions";
import { mergeUnlocks, sanitizeUnlocks, type UnlockedAchievements } from "@/lib/achievements/unlocks";
import { LOCAL_STORAGE_KEYS } from "@/lib/storage/keys";
import {
  createLocalStorageSnapshotCache,
  readLocalJsonObject,
  subscribeStorageEvents,
  writeLocalJson,
} from "@/lib/storage/local";

const STORAGE_KEY = LOCAL_STORAGE_KEYS.achievements;
export const ACHIEVEMENTS_STORAGE_EVENT = "achievements-storage-updated";

function readUnlocks(): UnlockedAchievements {
  const parsed = readLocalJsonObject(STORAGE_KEY);
  if (!parsed) {
    return {};
  }

  return sanitizeUnlocks(parsed);
}

function writeUnlocks(unlocks: UnlockedAchievements): void {
  writeLocalJson(STORAGE_KEY, unlocks, { eventName: ACHIEVEMENTS_STORAGE_EVENT });
}

export function getLocalUnlocks(): UnlockedAchievements {
  return readUnlocks();
}

const EMPTY_UNLOCKS: UnlockedAchievements = {};

const unlocksSnapshot = createLocalStorageSnapshotCache(STORAGE_KEY, readUnlocks, EMPTY_UNLOCKS);

export function subscribeAchievementsStorage(onStoreChange: () => void): () => void {
  return subscribeStorageEvents(ACHIEVEMENTS_STORAGE_EVENT, onStoreChange);
}

/** Stable-reference snapshot for useSyncExternalStore. */
export function getUnlocksSnapshot(): UnlockedAchievements {
  return unlocksSnapshot.getSnapshot();
}

export function getServerUnlocksSnapshot(): UnlockedAchievements {
  return EMPTY_UNLOCKS;
}

/** Records an unlock locally. Returns false if the achievement was already unlocked. */
export function saveLocalUnlock(id: AchievementId, unlockedAt: string): boolean {
  const current = readUnlocks();

  if (current[id]) {
    return false;
  }

  writeUnlocks({ ...current, [id]: unlockedAt });
  return true;
}

export function mergeUnlocksIntoLocal(remote: UnlockedAchievements): UnlockedAchievements {
  const merged = mergeUnlocks(readUnlocks(), remote);
  writeUnlocks(merged);
  return merged;
}
