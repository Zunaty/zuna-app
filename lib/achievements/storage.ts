import type { AchievementId } from "@/lib/achievements/definitions";
import { mergeUnlocks, sanitizeUnlocks, type UnlockedAchievements } from "@/lib/achievements/unlocks";

const STORAGE_KEY = "zuna-achievements";
export const ACHIEVEMENTS_STORAGE_EVENT = "achievements-storage-updated";

function readUnlocks(): UnlockedAchievements {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return sanitizeUnlocks(JSON.parse(raw));
  } catch {
    return {};
  }
}

function writeUnlocks(unlocks: UnlockedAchievements): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocks));
  window.dispatchEvent(new Event(ACHIEVEMENTS_STORAGE_EVENT));
}

export function getLocalUnlocks(): UnlockedAchievements {
  return readUnlocks();
}

const EMPTY_UNLOCKS: UnlockedAchievements = {};

let cachedStorageRaw: string | null | undefined;
let cachedSnapshot: UnlockedAchievements = EMPTY_UNLOCKS;

export function subscribeAchievementsStorage(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener(ACHIEVEMENTS_STORAGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(ACHIEVEMENTS_STORAGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Stable-reference snapshot for useSyncExternalStore. */
export function getUnlocksSnapshot(): UnlockedAchievements {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedStorageRaw) {
    return cachedSnapshot;
  }

  cachedStorageRaw = raw;
  cachedSnapshot = readUnlocks();
  return cachedSnapshot;
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
