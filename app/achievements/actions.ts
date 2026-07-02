"use server";

import { isAchievementId, type AchievementId } from "@/lib/achievements/definitions";
import { getLevelForPoints, getTotalPoints } from "@/lib/achievements/points";
import {
  getUnlockedIds,
  mergeUnlocks,
  resolveDerivedUnlocks,
  sanitizeUnlocks,
  type UnlockedAchievements,
} from "@/lib/achievements/unlocks";
import { createClient } from "@/lib/supabase/server";

export type AchievementSyncState = {
  error?: string;
  unlocks: UnlockedAchievements;
};

const SIGN_UP_ACHIEVEMENT: AchievementId = "meta-sign-up";

/**
 * Merges the given unlocks with the user's rows in Supabase, persists anything
 * new, and keeps profiles.points / profiles.level derived from the unlocked set.
 * Signed-in users always hold the sign-up achievement.
 */
async function syncUnlocksForUser(incoming: UnlockedAchievements): Promise<AchievementSyncState> {
  const local = sanitizeUnlocks(incoming);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to sync achievements.", unlocks: local };
  }

  const { data: rows, error: fetchError } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", user.id);

  if (fetchError) {
    return { error: fetchError.message, unlocks: local };
  }

  const remote: UnlockedAchievements = {};
  for (const row of rows ?? []) {
    if (isAchievementId(row.achievement_id)) {
      remote[row.achievement_id] = row.unlocked_at;
    }
  }

  const combined = mergeUnlocks(local, remote);
  if (!combined[SIGN_UP_ACHIEVEMENT]) {
    combined[SIGN_UP_ACHIEVEMENT] = new Date().toISOString();
  }

  // Unlocks earned on different devices may complete a dependency set only
  // once merged here, so resolve derived achievements server-side too.
  const { unlocks: merged } = resolveDerivedUnlocks(combined);

  const missing = getUnlockedIds(merged).filter((id) => !remote[id]);

  if (missing.length > 0) {
    const { error: insertError } = await supabase.from("user_achievements").upsert(
      missing.map((id) => ({
        user_id: user.id,
        achievement_id: id,
        unlocked_at: merged[id],
      })),
      { onConflict: "user_id,achievement_id", ignoreDuplicates: true },
    );

    if (insertError) {
      return { error: insertError.message, unlocks: merged };
    }

    const points = getTotalPoints(getUnlockedIds(merged));
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ points, level: getLevelForPoints(points) })
      .eq("id", user.id);

    if (profileError) {
      return { error: profileError.message, unlocks: merged };
    }
  }

  return { unlocks: merged };
}

/** First-visit sync: pushes guest unlocks up and returns the merged set. */
export async function syncAchievementsFromLocal(local: UnlockedAchievements): Promise<AchievementSyncState> {
  return syncUnlocksForUser(local);
}

/** Persists freshly earned unlocks for a signed-in user. */
export async function unlockAchievementsForUser(unlocks: UnlockedAchievements): Promise<AchievementSyncState> {
  return syncUnlocksForUser(unlocks);
}
