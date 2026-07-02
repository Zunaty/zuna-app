"use client";

import { useEffect } from "react";

import { useAchievements } from "@/components/achievements/achievement-provider";
import type { AchievementId } from "@/lib/achievements/definitions";

type AchievementPageVisitProps = {
  id: AchievementId;
};

/** Renders nothing; unlocks the given achievement when the page is visited. */
export function AchievementPageVisit({ id }: AchievementPageVisitProps) {
  const { unlock } = useAchievements();

  useEffect(() => {
    unlock(id);
  }, [id, unlock]);

  return null;
}
