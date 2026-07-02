import { ACHIEVEMENT_LIST, isAchievementId, type AchievementId } from "@/lib/achievements/definitions";

/** Map of achievement id → ISO timestamp of when it was unlocked. */
export type UnlockedAchievements = Partial<Record<AchievementId, string>>;

export function sanitizeUnlocks(value: unknown): UnlockedAchievements {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  const result: UnlockedAchievements = {};

  for (const [id, unlockedAt] of Object.entries(value)) {
    if (isAchievementId(id) && typeof unlockedAt === "string" && !Number.isNaN(Date.parse(unlockedAt))) {
      result[id] = unlockedAt;
    }
  }

  return result;
}

/** Union of both sets; when both sides have an unlock, the earliest timestamp wins. */
export function mergeUnlocks(a: UnlockedAchievements, b: UnlockedAchievements): UnlockedAchievements {
  const merged: UnlockedAchievements = { ...a };

  for (const [id, unlockedAt] of Object.entries(b) as [AchievementId, string][]) {
    const existing = merged[id];

    if (!existing || Date.parse(unlockedAt) < Date.parse(existing)) {
      merged[id] = unlockedAt;
    }
  }

  return merged;
}

export function getUnlockedIds(unlocks: UnlockedAchievements): AchievementId[] {
  return Object.keys(unlocks) as AchievementId[];
}

export type DerivedUnlockResult = {
  unlocks: UnlockedAchievements;
  added: AchievementId[];
};

/**
 * Adds achievements with requiredIds whose requirements are all met. The
 * derived unlock timestamp is the latest of its requirements, so the result is
 * deterministic no matter where or when resolution runs.
 */
export function resolveDerivedUnlocks(unlocks: UnlockedAchievements): DerivedUnlockResult {
  const result: UnlockedAchievements = { ...unlocks };
  const added: AchievementId[] = [];
  let changed = true;

  while (changed) {
    changed = false;

    for (const definition of ACHIEVEMENT_LIST) {
      if (!definition.requiredIds || result[definition.id]) {
        continue;
      }

      const requiredTimes: number[] = [];

      for (const requiredId of definition.requiredIds) {
        const unlockedAt = result[requiredId];
        if (!unlockedAt) {
          break;
        }
        requiredTimes.push(Date.parse(unlockedAt));
      }

      if (requiredTimes.length !== definition.requiredIds.length) {
        continue;
      }

      result[definition.id] = new Date(Math.max(...requiredTimes)).toISOString();
      added.push(definition.id);
      changed = true;
    }
  }

  return { unlocks: result, added };
}
